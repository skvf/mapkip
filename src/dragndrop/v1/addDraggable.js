var number = 3;
        
jsPlumb.ready(function() {

    var common = {
      isSource:true,
      isTarget:true,
      connector: ["Straight"],
      paintStyle:{ fill:"white", outlineStroke:"blue", strokeWidth:3 },
      hoverPaintStyle:{ outlineStroke:"lightblue" },
 
      /* Connector(Line)-Style */
      connectorStyle:{ outlineStroke:"gray", strokeWidth:1 },
      connectorHoverStyle:{ strokeWidth:2 }
    };

    jsPlumb.connect({
        source:"item_left",
        target:"item_right",
        endpoint:"Circle"
    });

    jsPlumb.draggable("item_left");
    jsPlumb.draggable("item_right");

    $( "#new_draggable_doctor" ).click(function() {
        createElement("Ficha Médica");
        // makes the item draggable
        jsPlumb.draggable("item_" + number);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Left", "Continuous"]
        }, common);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Right", "Continuous"]
        }, common);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Top", "Continuous"]
        }, common);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Bottom", "Continuous"]
        }, common);
        number++;
    });
    
    $( "#new_draggable_nurse" ).click(function() {
        createElement("Ficha Enfermagem");
        // makes the item draggable
        jsPlumb.draggable("item_" + number);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Left", "Continuous"]
        }, common);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Right", "Continuous"]
        }, common);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Top", "Continuous"]
        }, common);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Bottom", "Continuous"]
        }, common);
        number++;
    });
    
    $( "#new_draggable_psicology" ).click(function() {
        createElement("Ficha Psicologia");
        // makes the item draggable
        jsPlumb.draggable("item_" + number);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Left", "Continuous"]
        }, common);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Right", "Continuous"]
        }, common);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Top", "Continuous"]
        }, common);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Bottom", "Continuous"]
        }, common);
        number++;
    });
    
    $( "#new_draggable_nutrition" ).click(function() {
        createElement("Ficha Nutrição");
        // makes the item draggable
        jsPlumb.draggable("item_" + number);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Left", "Continuous"]
        }, common);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Right", "Continuous"]
        }, common);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Top", "Continuous"]
        }, common);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Bottom", "Continuous"]
        }, common);
        number++;
    });
    
    $( "#new_draggable_social_service" ).click(function() {
        createElement("Ficha Serviço social");
        // makes the item draggable
        jsPlumb.draggable("item_" + number);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Left", "Continuous"]
        }, common);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Right", "Continuous"]
        }, common);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Top", "Continuous"]
        }, common);
        jsPlumb.addEndpoint("item_" + number, { 
          anchors:["Bottom", "Continuous"]
        }, common);
        number++;
    });
});

function createElement(name) {
    // create element
    var node = document.createElement('div');
    console.log(node);
    var textnode = document.createTextNode(name);
    node.id = "item_" + number;
    node.className = 'item';
    node.appendChild(textnode);
    document.body.appendChild(node);

    var id = '#' + node.id;
    var draggableHTML = '<p>' + name + ' - ' +  number + '</p>';
        draggableHTML += '<input type="text" placeholder="Ator" class="form-control"          id="ator_' + number + '">';
        draggableHTML += '<input type="text" placeholder="Duração" class="form-control" id="duracao_' + number + '">';
        draggableHTML += '<input type="text" placeholder="Prazo" class="form-control" id="prazo_' + number + '">';
        draggableHTML += '<button class="btn btn_activity">Abrir Ficha</button>';
    $(id).html(draggableHTML);

    node.style.left = 500+'px';
    node.style.top = 500+'px';
}