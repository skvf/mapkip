import logging
import os
import subprocess
import sys
import time

import requests

MAPKIP_API_URL = "http://localhost:3000/api/planner"
SLEEP_INTERVAL = 60  # Tempo de espera em segundos
PRISM_HOME = "/home/mgm/Documents/dev/mapkip-prism-runner"
PRISM_TEMP = "/tmp/mapkip-prism-runner"


GENERIC_MDP_TEXT = """
mdp

module Patient

	// Temperature in tenths of degree: 
	// (Variables must be integer and with finite range)
	temp : [350..410] init 380;
	// (LoN : no=0,mild=1,moderate=2,great=3,severe=4)
	naCurrent : [0..4] init 4;
	// Allergic to medication?
	allergic : bool init false;	
        // Oxygen available?
	oxygenAvailable : bool init true;
	// Pregnant?
	pregnant : bool init false;

	// For every original action there are more than one action, because it must be ensured that the values of attributes
	// do never fall outside of the defined range.
	// A10.1
	[a101] temp > 372 & naCurrent < 2 & temp>=355 & temp<=405 -> 0.6:(temp'=370) + 0.3:(temp'=temp-5) + 0.1:(temp'=temp+5);
	[a101] temp > 372 & naCurrent < 2 & temp<355 -> 0.6:(temp'=370) + 0.3:(temp'=350) + 0.1:(temp'=temp+5);
	[a101] temp > 372 & naCurrent < 2 & temp>405 -> 0.6:(temp'=370) + 0.3:(temp'=temp-5) + 0.1:(temp'=410);
	// A10.2
	[a102] temp > 372 & naCurrent > 1 & temp>=355 & temp<=405 -> 0.8:(temp'=370) + 0.1:(temp'=temp-5) + 0.1:(temp'=temp+5);
	[a102] temp > 372 & naCurrent > 1 & temp<355 -> 0.8:(temp'=370) + 0.1:(temp'=350) + 0.1:(temp'=temp+5);
	[a102] temp > 372 & naCurrent > 1 & temp>405 -> 0.8:(temp'=370) + 0.1:(temp'=temp-5) + 0.1:(temp'=410);
	// A11
	[a11] !allergic & naCurrent < 3 & temp>=355 & temp<=405 -> 0.65:(temp'=370) + 0.25:(temp'=temp-5) + 0.1:(temp'=temp+5);
	[a11] !allergic & naCurrent < 3 & temp<355 -> 0.65:(temp'=370) + 0.25:(temp'=350) + 0.1:(temp'=temp+5);
	[a11] !allergic & naCurrent < 3 & temp>405 -> 0.65:(temp'=370) + 0.25:(temp'=temp-5) + 0.1:(temp'=410);
	// A13
	[a13] naCurrent < 2 & temp>=355 & temp<=405 -> 0.5:(temp'=temp-5) + 0.3:(temp'=temp-2) + 0.1:(temp'=temp) + 0.1:(temp'=temp+5);
	[a13] naCurrent < 2 & temp>=352 & temp<355 -> 0.5:(temp'=350) + 0.3:(temp'=temp-2) + 0.1:(temp'=temp) + 0.1:(temp'=temp+5);
	[a13] naCurrent < 2 & temp<352 -> 0.5:(temp'=350) + 0.3:(temp'=350) + 0.1:(temp'=temp) + 0.1:(temp'=temp+5);
	// A17
	[a17] temp > 385 & oxygenAvailable -> 0.6:(temp'=temp-5) + 0.3:(temp'=temp-2) + 0.1:(temp'=temp);

	// N10 
	[n10] !pregnant & naCurrent > 1 & naCurrent < 4 -> 0.7:(naCurrent'=0) + 0.2:(naCurrent'=naCurrent-1) + 0.1:(naCurrent'=naCurrent+1);
	[n10] !pregnant & naCurrent = 4 -> 0.7:(naCurrent'=0) + 0.2:(naCurrent'=naCurrent-1) + 0.1:(naCurrent'=naCurrent);
	// N11
	[n11] naCurrent = 3 -> 0.1:(naCurrent'=0) + 0.3:(naCurrent'=naCurrent-1) + 0.4:(naCurrent'=naCurrent) + 0.2:(naCurrent'=naCurrent+1);
	[n11] naCurrent = 4 -> 0.1:(naCurrent'=0) + 0.3:(naCurrent'=naCurrent-1) + 0.4:(naCurrent'=naCurrent) + 0.2:(naCurrent'=4);
	// N24
	[n24] naCurrent = 1 | naCurrent = 2 -> 0.3:(naCurrent'=0) + 0.4:(naCurrent'=naCurrent-1) + 0.3:(naCurrent'=naCurrent+1);

endmodule

rewards "cost"
	[a101] true : 0.08 + 0.10;
	[a102] true : 0.08 + 0.30;
	[a11] true : 0.08 + 0.15;
	[a13] true : 0.16;
	[a17] true : 0.32 + 0.15;

	[n10] true : 0.08;
	[n11] true : 0.32;
	[n24] true : 0.16;
endrewards

// Time in minutes
rewards "time"
	[a101] true : 5;
	[a102] true : 5;
	[a11] true : 5;
	[a13] true : 15;
	[a17] true : 20;

	[n10] true : 5;
	[n11] true : 20;
	[n24] true : 10;
endrewards

"""

GENERIC_MDP_PROPERTIES = """
Pmax=? [ F (naCurrent=0&temp<=370&temp>360) ]

R{"time"}min=? [ F (naCurrent=0&temp<=370&temp>360) ]

R{"cost"}min=? [ F (naCurrent=0&temp<=370&temp>360) ]

"""

# Configuração do logger
logging.basicConfig(level=logging.INFO)
logger_runner = logging.getLogger("mapkip-prism-runner")

def get_planners():
    """
    Obtém a lista de planners da API.
    """
    response = requests.get(f"{MAPKIP_API_URL}/next")
    response.raise_for_status()
    return response.json()

def update_planner_status(planner_id, status):
    """
    Atualiza o status de um planner na API.

    Args:
        planner_id (str): ID do planner a ser atualizado.
        status (str): Novo status do planner.
        result (str): Resultado da execução do planner.
    """
    
    # open log file and read the content
    log_file = os.path.join(PRISM_TEMP, f"{planner_id}", "runner.log")
    with open(log_file, "r") as file:
        log = file.read()
        
    graph_file = os.path.join(PRISM_TEMP, f"{planner_id}", "output.dot")
    with open(graph_file, "r") as file:
        graph = file.read()
    
    
    data = {
        "_id": planner_id,
        "status": status,
        "output": {
            "log": log,
            "graph": graph
        }
    }
    response = requests.post(f"{MAPKIP_API_URL}/edit", json=data)
    response.raise_for_status()
    
    return response.json()

def save_prism_file(planner_id, mdp_text):
    """
    Salva o texto do PRISM em um arquivo temporário.

    Args:
        planner_id (str): ID do planner.
        mdp_text (str): Texto do PRISM.
    """
    directory = os.path.join(PRISM_TEMP, f"{planner_id}")
    os.makedirs(directory, exist_ok=True)
    file_path = os.path.join(directory, "model.prism")
    with open(file_path, "w") as file:
        file.write(mdp_text)
    return file_path

def save_prism_properties_file(planner_id, mdp_properties_text):
    """
    Salva o texto do PRISM PROPERTIES em um arquivo temporário.

    Args:
        planner_id (str): ID do planner.
        mdp_properties_text (str): Texto do PRISM PROPERTIES.
    """
    directory = os.path.join(PRISM_TEMP, f"{planner_id}")
    os.makedirs(directory, exist_ok=True)
    file_path = os.path.join(directory, "properties.props")
    with open(file_path, "w") as file:
        file.write(mdp_properties_text)
    return file_path

def execute_prism(planner_id):
    """
    Executa o arquivo PRISM.

    Args:
        planner_id (str): Id do planner.
    """
    # command: bash {PRISM_HOME}/generate-plan.sh [model] [properties] [target] [outputfile]
    # example: bash generate-plan.sh rice.prism rice.prop 1 plan1
    command = ["bash", f"{PRISM_HOME}/generate-plan.sh", f"{PRISM_TEMP}/{planner_id}/model.prism", f"{PRISM_TEMP}/{planner_id}/properties.props", "1", f"{PRISM_TEMP}/{planner_id}/output"]
    
    pprint_command = " ".join(command)
    logger_runner.info(f"Executing '{pprint_command}'")
    result = subprocess.run(command, capture_output=True, text=True)
    return result.stdout, result.returncode


def setup_logger(planner_id):
    # Configurar o logger para cada planner
    log_directory = f"{PRISM_TEMP}/{planner_id}"
    os.makedirs(log_directory, exist_ok=True)
    log_file = os.path.join(log_directory, "runner.log")

    logger = logging.getLogger(planner_id)
    logger.setLevel(logging.INFO)
    
    # Verificar se o logger já possui handlers para evitar duplicidade
    if not logger.handlers:
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
        logger.addHandler(file_handler)
    
    return logger

def main(pool_interval):
    while True:
        logger_runner.info("Checking for planners...")
        planners = get_planners()
        if not planners:
            logger_runner.info(f"No planners found. Waiting for {pool_interval} seconds...")
            time.sleep(pool_interval)
            continue
        
        for planner in planners:
            planner_id = planner["_id"]
            mdp_text = planner["mdpText"]
            # mdp_text = GENERIC_MDP_TEXT
            # mdp_properties_text = GENERIC_MDP_PROPERTIES
            mdp_properties_text = planner["content"]["Property"]
                       
            
            logger = setup_logger(planner_id)
            logger.info(f"Executing planner {planner_id}...")
                        
            file_path = save_prism_file(planner_id, mdp_text)
            logger.info(f"PRISM file saved at {file_path}")
            
            file_path = save_prism_properties_file(planner_id, mdp_properties_text)
            logger.info(f"PRISM properties file saved at {file_path}")
            
            # Execute the file
            logger.info("Executing PRISM file...")
            output, returncode = execute_prism(planner_id)
            
            # Save the output to logger
            logger.info(output)
            
            # Update planner status based on execution result
            if returncode == 0:
                logger.info("Planner executed successfully.")
                update_planner_status(planner_id, "completed")
            else:
                logger.error("Error executing planner.")
                update_planner_status(planner_id, "error")
            

if __name__ == "__main__":
    # arg 'pool_interval' is the time to wait between checks for new planner  
    
    if len(sys.argv) > 1:
        pool_interval = int(sys.argv[1]) or SLEEP_INTERVAL
    main(pool_interval)
