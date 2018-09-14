document.addEventListener("DOMContentLoaded", ()=> {
  //Declare Variables for CurrentIdea and CurrentStructure
  let currentIdea
  let currentStructure = []
  let currentIndex

//general queries (main document containers)
let formContainer = document.getElementById('form_container')
let allProjectDiv = document.getElementById("all_project_div")
let projectList = document.getElementById('project_list')
allProjectDiv.addEventListener("click", allIdeasPage)
let allIdeasDiv = document.getElementById('all_ideas_for_project_div')

//query for form to submit new project
let newProjectForm = document.getElementById('create_new_project')
let newProjectTitle = document.querySelector("[name=new_project_title]")
let newProjectProtagonist = document.querySelector("[name=project_protagonist]")
newProjectForm.addEventListener("submit", submitNewProject)

//query for form to submit idea
let projectIdeaForm = document.getElementById('create-project-idea-form')
let exisitingProjectTitleDropdown = document.querySelector('.exisiting_project')
let ideaTitle = document.querySelector("[name=idea_title]")
let ideaContent = document.querySelector("[name=idea_content]")
let ideaProtagonist = document.querySelector("[name=protagonist]")
let ideaAntagonist = document.querySelector("[name=antagonist]")
let ideaStart = document.getElementById('start')
let ideaEnd = document.getElementById('end')
let ideaAct = document.getElementById('act')
let ideaTurn = document.getElementById('turn')
let ideaDescription = document.getElementById('description')
let ideaConflict = document.getElementById('conflict')
let ideaMisc = document.getElementById('miscellaneous')
let ideaResearch = document.getElementById('research')
let ideaInspo = document.getElementById('inspiration')
projectIdeaForm.addEventListener("submit", submitProjectIdea)

//query for navbar
let navbar = document.getElementById('navbar_items')
navbar.addEventListener("click", viewAllProjects)
navbar.addEventListener("click", createProject)
navbar.addEventListener("click", searchByAttribute)


//GET dropdown for exisiting project titles
fetch("http://localhost:3000/api/v1/projects")
  .then(rep => rep.json())
  .then(function (projects) {
    projects.forEach(function (project) {
      let option = document.createElement("option")
      option.innerText = project.title
      option.value = project.id
      exisitingProjectTitleDropdown.append(option)
    })
  })


//POST submit a new project on our "homepage"
function submitNewProject(event) {
  event.preventDefault()
  fetch("http://localhost:3000/api/v1/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({title: newProjectTitle.value , protagonist: newProjectProtagonist.value})
  })
  .then(res => res.json())
  .then(function (project) {
    let option = document.createElement("option")
    option.innerText = project.title
    option.value = project.id
    exisitingProjectTitleDropdown.append(option)
  })
  newProjectTitle.value=""
  newProjectProtagonist.value=""
}


function submitProjectIdea(event) {
  event.preventDefault()

  fetch("http://localhost:3000/api/v1/ideas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: ideaTitle.value,
      content: ideaContent.value ,
      protagonist: ideaProtagonist.value,
      antagonist: ideaAntagonist.value,
      begins: ideaStart.value,
      ends: ideaEnd.value,
      act: ideaAct.value,
      turn: ideaTurn.value,
      description: ideaDescription.value,
      conflict: ideaConflict.value,
      research: ideaResearch.value,
      inspiration: ideaInspo.value,
      miscellaneous: ideaMisc.value,
      project_id: 1
    })
  })
  .then(r => r.json())
  .then(newIdea => {
    currentIdea = newIdea
    let x = currentStructure.length + 1
    currentStructure.push({[x]: newIdea["id"]})
    showSingleIdea(newIdea)
  projectIdeaForm.reset()

  fetch("http://localhost:3000/api/v1/structures",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ order:currentStructure,  project_id: currentIdea.project_id})
    }
  )
  .then(r => r.json())
  })
}

//GET user goes to navbar & clicks "view all projects"
function viewAllProjects(event) {
  if (event.target.className === "view_projects") {
    formContainer.innerHTML = ""
    allProjectDiv.innerHTML = ""
    allIdeasDiv.innerHTML = ""

    fetch("http://localhost:3000/api/v1/projects")
      .then(rep => rep.json())
      .then(function (projects) {
        projects.forEach(function (project) {
          let bulletPoint = document.createElement("li")
          bulletPoint.innerText = project.title
          bulletPoint.innerHTML = `<a data-id='${project.id}' class='project_title' href='#'>${project.title}</a>`
          projectList.append(bulletPoint)
          allProjectDiv.append(projectList)
        })
      })
  }
}

//GET user clicks on a project title & goes to the idea page for that project
function allIdeasPage(event) {
  findStructure(event)
  if (event.target.className === "project_title") {
    allProjectDiv.innerHTML = ""
    let projectID = event.target.dataset.id
    fetch("http://localhost:3000/api/v1/ideas")
      .then(rep => rep.json())
      .then(function (ideas) {
        let project_ideas = ideas.filter(idea => idea.project_id === parseInt(projectID))


        project_ideas.forEach(function (idea) {
          let ideaContainer = document.createElement("div")
          ideaContainer.className= "idea_container"
          let ideaCard = document.createElement("div")
          ideaCard.className = "idea_card"
          let ideaFront = document.createElement("div")
          ideaFront.className = "idea_front"
          let ideaBack = document.createElement("div")
          ideaBack.className = "idea_back"

          let editIdeaButton = document.createElement("button")
          editIdeaButton.dataset.id = idea.id
          editIdeaButton.innerText = "Edit"

          let ideaBoxFront = document.createElement("div")
          ideaBoxFront.className = "idea_box_front"
          ideaBoxFront.dataset.id = idea.id
          ideaBoxFront.innerHTML = `
          <p>Title: ${idea.title}</p>
          <p>Content: ${idea.content}</p>
          `
          ideaBoxFront.append(editIdeaButton)
          ideaCard.append(ideaBoxFront)

          let ideaBoxBack = document.createElement("div")
          ideaBoxBack.className = "idea_box_back"
          ideaBoxBack.innerHTML = `
          <p>Protagonist: ${idea.protagonist}</p>
          <p>Antagonist: ${idea.antagonist}</p>
          <p>Begins: ${idea.begins}</p>
          <p>Ends: ${idea.ends}</p>
          <p>Act: ${idea.act}</p>
          <p>Turn: ${idea.turn}</p>
          `
          ideaCard.append(ideaBoxBack)
          ideaContainer.append(ideaCard)
          currentIdea = idea
          showSingleIdea(currentIdea)
          return allIdeasDiv.append(ideaContainer)
          // return allIdeasDiv.append(ideaBox)
        })
      })
  }
}


//POST when user clickes on "Create A Project" on the navbar
function createProject(event) {
  event.preventDefault()
  if (event.target.className === "create_project") {
    allProjectDiv.innerHTML = ""
    allIdeasDiv.innerHTML = ""
    formContainer.append(newProjectForm)
    projectIdeaForm.innerHTML = ""

    fetch("http://localhost:3000/api/v1/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({title: newProjectTitle.value , protagonist: newProjectProtagonist.value})
    })
    .then(res => res.json())
    .then(function (project) {
      let option = document.createElement("option")
      option.innerText = project.title
      option.value = project.id
      exisitingProjectTitleDropdown.append(option)
    })
    newProjectTitle.value=""
    newProjectProtagonist.value=""
  }
}

//Activate Edit button
let editButton = document.getElementById('edit-btn')
editButton.addEventListener('click', event => editSingleIdea(event))

//Populate Single View Card with Content and Values
function showSingleIdea(idea){
  editButton.dataset.editId = idea.id

  ideaTitle.value = idea.title
  ideaContent.value = idea.content
  ideaProtagonist.value = idea.protagonist
  ideaAntagonist.value = idea.antagonist
  ideaStart.value = idea.begins
  ideaEnd.value = idea.ends
  ideaAct.value = idea.act
  ideaTurn.value = idea.turn
  ideaDescription.value = idea.description
  ideaConflict.value = idea.conflict
  ideaResearch.value = idea.research
  ideaInspo.value = idea.inspiration
  ideaMisc.value = idea.miscellaneous
}

//Update Single View Card with new Content and Values
function editSingleIdea(event){
  fetch("http://localhost:3000/api/v1/ideas/" + event.target.dataset.editId, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: ideaTitle.value,
      content: ideaContent.value ,
      protagonist: ideaProtagonist.value,
      antagonist: ideaAntagonist.value,
      begins: ideaStart.value,
      ends: ideaEnd.value,
      act: ideaAct.value,
      turn: ideaTurn.value,
      description: ideaDescription.value,
      conflict: ideaConflict.value,
      research: ideaResearch.value,
      inspiration: ideaInspo.value,
      miscellaneous: ideaMisc.value,
      project_id: 1
    })
  })
  .then(r => r.json())
  .then(newIdea => showSingleIdea(newIdea))
}

//Activate Save Structure link
let saveStructureLink = document.querySelector('.save_structure')
saveStructureLink.addEventListener('click', event => saveStructure(event))

function saveStructure(event) {
  const newStructureTitle = prompt("Please provide a name for this structure.")
  fetch("http://localhost:3000/api/v1/structures",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({title: newStructureTitle, order:currentStructure, saved: true, project_id: currentIdea.project_id})
    }
  )
  .then(r => r.json())
  .then(r => currentStructure = r.order)

  console.log(currentStructure)
}

function findStructure(event) {
  fetch("http://localhost:3000/api/v1/projects/" + event.target.dataset.id)
    .then(rep => rep.json())
    .then(function (project) {
      if (project.structures.length > 0) {
        currentStructure =
        project.structures[(project.structures.length - 1)].order
        currentIdea = project.ideas[currentStructure.length - 1]
      } else {
        currentStructure =[]
      }
    })
}

//Previous Button

let previousButton = document.querySelector('.previous-btn')
previousButton.addEventListener('click', event => previousIdea())

function previousIdea() {
  if (currentStructure.length <= 1) {
    alert("This is the first idea in the current structure.")
  } else {
    showSingleIdea(currentIdea)
  }
}

// currentIndex = currentStructure.findIndex(isLikeCurrent)
// function isLikeCurrent(element) {
// for (const key in currentStructure) {
//     if currentStructure[key] === element
//   element === currentIdea.id
//   }

//Search Ideas by Attribute

function searchByAttribute(event) {
  if (event.target.className === "search") {
    formContainer.innerHTML = ""
    allProjectDiv.innerHTML = ""
    allIdeasDiv.innerHTML = ""

    let searchBy = event.target.id

    fetch("http://localhost:3000/api/v1/structures",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({search: true, search_by: searchBy, saved: true, order: currentStructure, project_id: currentIdea.project_id})
      }
    )
    .then(r => r.json())
    .then(ideas => showByAttribute(ideas))
  }
}

function showByAttribute(ideas) {
  console.log(ideas)
  debugger
  ideas.forEach(function (idea) {
    let ideaContainer = document.createElement("div")
    ideaContainer.className= "idea_container"
    let ideaCard = document.createElement("div")
    ideaCard.className = "idea_card"
    let ideaFront = document.createElement("div")
    ideaFront.className = "idea_front"
    let ideaBack = document.createElement("div")
    ideaBack.className = "idea_back"

  })
}



}) //dom event listener
