var left_cover = document.getElementById("left-cover");
var left_form = document.getElementById("left-form");

var right_cover = document.getElementById("right-cover");
var right_form = document.getElementById("right-form");

function switchSignup() {
    right_form.classList.add("fade-in-element");
    left_cover.classList.add("fade-in-element");

    left_form.classList.add("form-hide");
    left_cover.classList.remove("cover-hide");
    right_form.classList.remove("form-hide");
    right_cover.classList.add("cover-hide");
}


// Import packages
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const uuid = require("uuid");

const fs = require("fs");

// Aplicatia
const app = express();

// Middleware
app.use(morgan("tiny"));
app.use(bodyParser.json());
app.use(cors());

// Create
// Adaug user nou
app.post("/users", (req, res) => {
    //imi aduc un array cu toti cainii existenti
    const usersList = readJSONFile();
    //imi creez userle nou cu datele venite din frontend
    var newUser = {
        id : uuid.v4.apply(),//ii dau un id automat
        username: req.body.username,//pentru ca este un request post, are un body pe care sunt transmisi parametrii noului user
        parola: req.body.parola
    }

    //la lista cainilor existenti adaug noul user
    usersList.push(newUser);
    //scriu noua lista care contine userle nou in fisier
    writeJSONFile(usersList);
    //trimit raspuns ca totul a fost ok
    res.status(200).send(newUser);
});

// Read One
app.get("/users/:id", (req, res) => {
  const usersList = readJSONFile();
  var id = req.params.id;
  console.log(id);
  var checkIfUserExists = false;
  usersList.forEach(user => {
      if(user.id === id) {
          checkIfUserExists = true;
          res.status(200).send(user);
      }
  });

  if(checkIfUserExists === false) {
      res.status(404).send("No user found!");
  }
});

// Read All
app.get("/users", (req, res) => {
  const usersList = readJSONFile();
  if(usersList != undefined){
    res.status(200).send(usersList);
  } else {
      res.status(404).send("No user found");
  }

});

// Update
app.put("/user/:id", (req, res) => {
    //iau id-ul care corespunde lui :id
    var id = req.params.id;
    //flag daca userle exista
    var checkIfUserExists = false;
    //imi iau toti cainii existenti
    const usersList = readJSONFile();
    //caut userle cu id-ul dat
    for(let i = 0; i < usersList.length; i++) {
        if(usersList[i].id === id) {
            //daca userle exista il actualizez
            usersList[i].username = req.body.username;
            usersList[i].parola = req.body.parola;
            checkIfUserExists = true;
            //opresc forul pentru ca deja am gasit userle
            break;
        }
    }

    if(checkIfUserExists === true) {
        //daca am gasit un user sa il updatam, rescriem fisierul cu array-ul de caini actualizat
        writeJSONFile(usersList);
        res.status(200).send("User updated!");
    } else {
        //daca nu am gasit un user cu id-ul respectiv, returnez eroare
        res.status(404).send("User not found!");
    }
});

// Delete
app.delete("/user/:id", (req, res) => {
  const usersList = readJSONFile();
  var id = req.params.id;
  var checkIfUserExists = false;
  for(let i = 0; i < usersList.length; i++) {
      if(usersList[i].id === id) {
          checkIfUserExists = true;
          //sterg userle de pe pozitia i
          //splice sterge de la indexul i atatea elemente cate indica al doilea argument, in cazul nostru 1
          usersList.splice(i, 1);
          break;
      }
  }

  if(checkIfUserExists === true) {
    //daca am gasit un user sa il stergem, rescriem fisierul cu array-ul de caini fara userle sters
    writeJSONFile(usersList);
    res.status(200).send("User deleted!");
} else {
    //daca nu am gasit un user cu id-ul respectiv, returnez eroare
    res.status(404).send("User not found!");
}

});

// Functia de citire din fisierul db.json
function readJSONFile() {
  return JSON.parse(fs.readFileSync("db.json"))["users"];
  //fs citeste din fisier ca si string; JSON.parse transforma stringul in intr-un obiect si de acolo luam array-ul users
}

// Functia de scriere in fisierul db.json
function writeJSONFile(content) {
  fs.writeFileSync(
    "db.json",
    JSON.stringify({ users: content }, null, 4),
    "utf8",
    err => {
      if (err) {
        console.log(err);
      }
    }
  );
}

// Pornim server-ul
app.listen("3000", () =>
  console.log("Server started at: http://localhost:3000")
);


function getUsers() {
    fetch('http://localhost:3000/users', {
        method: 'get'
    }).then((response) => {
        response.json().then((data) => {
            //am adus datele
            var body = document.getElementsByTagName("body")[0];
            var ul = document.createElement("ul");
            ul.setAttribute("id", "user-list")
            for (let i = 0; i < data.length; i++) {
                var li = document.createElement("li");
                li.appendChild(document.createTextNode(data[i].username));

                var updateButton = document.createElement("button");
                updateButton.appendChild(document.createTextNode("Change user"));
                updateButton.style.marginLeft = "3%";
                var deleteButton = document.createElement('button');
                deleteButton.appendChild(document.createTextNode("Delete user"));
                deleteButton.style.marginLeft = "3%";
                deleteButton.onclick = function () { deleteUser(data[i].id) }

                var parola = document.createElement("parola");
                img.setAttribute("src", data[i].img);
                img.style.width = "50px";
                img.style.height = "50px";
                img.style.marginLeft = "3%";

                li.appendChild(updateButton);
                li.appendChild(deleteButton);
                li.appendChild(img);
                li.appendChild(document.createElement("hr"));
                li.style.marginTop = "3%";

                ul.appendChild(li);
            }
            body.appendChild(ul);
        })
    })
}

getUsers();

function addUser() {
    var username = document.getElementById("input-username").value;
    var parola = document.getElementById("input-parola").value;
    var newuser = {
        username: username,
        parola: parola
    }
    fetch('http://localhost:3000/users', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
    }).then(function (response) {
        console.log(response);
    })
}

function deleteUser(id) {
    fetch('http://localhost:3000/users/' + id, {
        method: 'delete',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        window.location.reload();
    })
}

function updateUser() {
    var id = document.getElementById("input-id").value;
    var username = document.getElementById("input-update-username").value;
    var parola = document.getElementById("input-update-parola").value;
    var newuser = {
        username: username,
        parola: parola
    }

    console.log(newUser, id)

    fetch('http://localhost:3000/users/' + id, {
        method: 'put',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
    }).then(function (response) {
        window.location.reload();
    })
}
