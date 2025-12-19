var number = 3;
var toggleRight = 1;
var toggleLeft = 1;

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

    let generateRandomId = () => {
      let s4 = () => {
          return (1 + Math.random())
              .toString(32)
              .substring(2);
      }
      return s4();
    }

    function configureJsPlumb(item_id) {
      jsPlumb.draggable(item_id, {
        containment: true,
        grid: [10, 10]
      })
      jsPlumb.addEndpoint(item_id, { 
        anchors:["Left", "Continuous"]
      }, common);
      jsPlumb.addEndpoint(item_id, { 
        anchors:["Right", "Continuous"]
      }, common);
      jsPlumb.addEndpoint(item_id, { 
        anchors:["Top", "Continuous"]
      }, common);
      jsPlumb.addEndpoint(item_id, { 
        anchors:["Bottom", "Continuous"]
      }, common);
    }

    document.getElementById("new_draggable_artifact").addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const elementId = createElement('artifact');
      const _id = 'item_' + number
      
      configureJsPlumb(_id)
      // save on database
      
      number++
    })

    document.getElementById("new_draggable_tatic").addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const elementId = createElement('tatic');
      const _id = 'item_' + number
      
      configureJsPlumb(_id)
      
      number++
    })

    document.getElementById("new_draggable_roles").addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const elementId = createElement('roles');
      const _id = 'item_' + number
      
      configureJsPlumb(_id)
      
      number++
    })   

    document.getElementById("new_section_button").addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      let sectionName = prompt("What is the section name? Example: Vital Signs, Current Problem, etc.")
      alert("Configurado " + sectionName)

      // teria que salvar no banco local de seções relacionando com o item
    })
    
    $('#new_element_button').click(function() {
        if(toggleLeft){
            $('#sideBarLeft').animate({left: 0});      
            $('#sideBarLeft').css("display", "block");
            toggleLeft = 0;
        }
        else{
            $('#sideBarLeft').animate({left: -300});
            $('#sideBarLeft').css("display", "none");
            toggleLeft = 1;
        }
    });
});

function createElement(name) {
    
    var diagram = document.getElementById("diagramContainer");
    // create element
    var node = document.createElement('div');
    console.log(node);
    var textnode = document.createTextNode(name);
    node.id = "item_" + number;
    node.className = 'item';
    node.appendChild(textnode);
    document.getElementById("diagramContainer").appendChild(node);

    var id = '#' + node.id;
    var draggableHTML = '<p>' + name + ' - ' +  number + '</p>';
    draggableHTML += '<input id="showRight" onclick="showRight(this.parentNode.id)" class="btn new_element" type="Submit" value="Set Attributes">';
    $(id).html(draggableHTML);

    node.style.left = 400+'px';
    node.style.top = 200+'px';
    
    return id;
}

function Move() {
  var elem = document.getElementById("sideBarRight");   
  var pos = -300;
  var id = setInterval(frame, 1);
  function frame() {
    if (pos == 0) {
      clearInterval(id);
    } else {
      pos++; 
      elem.style.right = pos + 'px'; 
    }
  }
}

function showRight (id) {
    if (toggleRight == 0) {
        document.getElementById("sideBarRight").style.display = "none";
        toggleRight = 1;
    } else {
        document.getElementById("sideBarRight").style.display = "block";
        toggleRight = 0;
        document.getElementById("nome").innerHTML  = id;
        
    }
}