
    function addMoreOption(optionList){
        var p = document.getElementById(optionList);
        var newdiv = document.createElement("div");
        newdiv.innerHTML = "<input type='text' name='options' class='form-control' placeholder='You are greedy!' required>";
        p.appendChild(newdiv);
    };
    
    
