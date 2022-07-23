
// save_to_local_storage()
retrieve_data()
initAddNewTodo()

// const todoList = document.querySelector('.to_do_list')
// todoList.querySelector('.to_do_list_main').addEventListener('click', () => {
//   todoList.querySelector('.to_do_list_sub').classList.toggle('active')
// })

function addGlobalEventListener(type, selector, callback) {
  document.addEventListener(type, e => {
    if (e.target.matches(selector)) callback(e)
  })
}

function initAddNewTodo() {
  const newTodoSubmit = document.getElementById('new_to_do_submit')
  const newTodoTitle = document.getElementById('new_to_do_title')
  const newTodoDateTime = document.getElementById('new_to_do_datetime')
  newTodoSubmit.addEventListener('click', () => {
    if (!newTodoTitle.value || !newTodoDateTime.value) return

    let id = 1
    let keys = Object.keys(localStorage)

    if (keys.length > 0) id = Math.max(...keys) + 1

    let newTodo = {
      id: id,
      title: newTodoTitle.value,
      deadline: newTodoDateTime.value,
      done: false
    }

    localStorage.setItem(id, JSON.stringify(newTodo))

    newTodoTitle.value = ""
    newTodoDateTime.value = ""

    retrieve_data()
  })
}

function format_special_day(date) {
  const today = new Date()
  if (today.getDate() == date.getDate() &&
    today.getMonth() == date.getMonth() &&
    today.getFullYear() == date.getFullYear()) return "Today"
  else if (today.getDate() + 1 == date.getDate() &&
    today.getMonth() == date.getMonth() &&
    today.getFullYear() == date.getFullYear()) return "Tomorrow"
  else if (today.getDate() - 1 == date.getDate() &&
    today.getMonth() == date.getMonth() &&
    today.getFullYear() == date.getFullYear()) return "Yesterday"
  else return null
}

function retrieve_data() {

  const container = document.getElementById('to_do_container')
  const doneContainer = document.getElementById('to_do_container_done')
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  let children = []
  let doneChildren = []

  let keys = Object.keys(localStorage)
  let data = []

  keys.forEach(key => {
    let todo = localStorage.getItem(key)
    data.push(JSON.parse(todo))
  })

  data.sort(
    (a, b) => {
      if (new Date(a.deadline) > new Date(b.deadline)) return 1
      else if (new Date(a.deadline) < new Date(b.deadline)) return -1
      else return 0
    }
  )

  data.map(todo => {
    const copy = document.createElement('div')

    copy.setAttribute("class", "to_do_list")
    copy.setAttribute("id", todo.id)

    copy.innerHTML = `<div class="to_do_list_main">
                        <div>
                          <h4 class="to_do_list_title">title</h4>
                          <p class="to_do_list_datetime">date | time</p>
                        </div>
                        <div class="to_do_list_check">
                        </div>
                      </div>
                      `

    copy.querySelector('.to_do_list_title').innerText = todo.title

    let deadline = new Date(todo.deadline)
    let date = `${weekday[deadline.getDay()]}, ${deadline.getDate()} ${months[deadline.getMonth()]} ${deadline.getFullYear()}`

    date = format_special_day(deadline) ?? date

    if (isOverdue(deadline)) {
      date = "(Overdue) " + date
      copy.classList.add('overdue')
    }

    let hour = deadline.getHours() < 10 ? "0" + deadline.getHours() : deadline.getHours()
    let minute = deadline.getMinutes() < 10 ? "0" + deadline.getMinutes() : deadline.getMinutes()

    deadline = `${date} | ${hour}:${minute}`

    copy.querySelector('.to_do_list_datetime').innerText = deadline

    const itemContainer = document.createElement('div')
    itemContainer.classList.add('to_do_list_sub')
    itemContainer.appendChild(document.createElement('hr'))


    if (todo.subitem) {

      itemContainer.style.setProperty('--total-sub-item', todo.subitem.length + 1)

      todo.subitem.map((item, index) => {
        const itemElement = document.createElement('div')
        itemElement.classList.add('to_do_list_sub_item')

        const titleElement = document.createElement('p')
        titleElement.classList.add('to_do_list_title')
        titleElement.classList.add('sub')

        const checkElement = document.createElement('div')
        checkElement.classList.add('to_do_list_check_sub')

        checkElement.addEventListener('click', () => set_sub_todo(todo.id, index, checkElement))

        titleElement.innerText = item.title
        checkElement.innerHTML = (item.done) ? `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        width="18px" height="18px" viewBox="0 0 40 40" style="enable-background:new 50 50 50 40;" xml:space="preserve">
    <g>
      <path fill="gray" d="M20,0C8.974,0,0,8.973,0,20c0,11.027,8.974,20,20,20c11.029,0,20-8.973,20-20C40,8.973,31.029,0,20,0z M28.818,17.875
        l-8.562,8.564c-0.596,0.595-1.377,0.893-2.158,0.893c-0.779,0-1.561-0.298-2.156-0.893l-4.758-4.758
        c-1.191-1.191-1.191-3.124,0-4.313c1.191-1.192,3.121-1.192,4.314,0l2.6,2.6l6.408-6.407c1.188-1.189,3.123-1.189,4.312,0
        C30.01,14.752,30.01,16.684,28.818,17.875z"/>
    </g>
    </svg>` : ''

        itemElement.appendChild(titleElement)
        itemElement.appendChild(checkElement)
        itemContainer.appendChild(itemElement)

      })
    } else {
      itemContainer.style.setProperty('--total-sub-item', 1)
    }

    copy.appendChild(itemContainer)
    copy.querySelector('.to_do_list_main').addEventListener('click', () => {
      itemContainer.classList.toggle('active')
    })
    copy.querySelector('.to_do_list_check').addEventListener("click", () => set_todo(todo.id))



    if (!todo.done) {

      const newSubTodoEl = document.createElement('div')
      newSubTodoEl.classList.add('to_do_list_sub_item')
      newSubTodoEl.innerHTML = `<input type="text" placeholder="add new sub list" class="new_to_do_sub_title">
      <button type="submit" class="new_to_do_sub_submit">
        <svg enable-background="new 0 0 50 50" height="15px" id="Layer_1" version="1.1" viewBox="0 0 50 50"
          width="15px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink">
          <path
            d="M18,18h-7.431C7.723,18,5,21.122,5,23.969v2.062C5,28.877,7.723,32,10.569,32H18v7.432  C18,42.278,21.124,45,23.97,45h2.062C28.878,45,32,42.278,32,39.432V32h7.433C42.279,32,45,28.877,45,26.03v-2.062  C45,21.122,42.279,18,39.433,18H32v-7.433C32,7.721,28.879,5,26.032,5H23.97C21.124,5,18,7.721,18,10.567V18z"
            fill="rgb(241,241,241)" />
        </svg>
      </button>`

      const newSubTodoTitle = newSubTodoEl.querySelector('.new_to_do_sub_title')
      const newSubTodoBtn = newSubTodoEl.querySelector('.new_to_do_sub_submit')

      newSubTodoBtn.addEventListener('click', () => {
        if (!newSubTodoTitle.value || newSubTodoTitle.value.length > 20) return
        add_sub_todo(todo.id, newSubTodoTitle.value)
        itemContainer.appendChild(newSubTodoEl)
      })

      itemContainer.appendChild(newSubTodoEl)

      children.push(copy)

    } else {
      copy.classList.add('done')
      copy.querySelector('.to_do_list_check').innerHTML = `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
      width="28px" height="28px" viewBox="0 0 40 40" style="enable-background:new 50 50 50 40;" xml:space="preserve">
  <g>
    <path fill="gray" d="M20,0C8.974,0,0,8.973,0,20c0,11.027,8.974,20,20,20c11.029,0,20-8.973,20-20C40,8.973,31.029,0,20,0z M28.818,17.875
      l-8.562,8.564c-0.596,0.595-1.377,0.893-2.158,0.893c-0.779,0-1.561-0.298-2.156-0.893l-4.758-4.758
      c-1.191-1.191-1.191-3.124,0-4.313c1.191-1.192,3.121-1.192,4.314,0l2.6,2.6l6.408-6.407c1.188-1.189,3.123-1.189,4.312,0
      C30.01,14.752,30.01,16.684,28.818,17.875z"/>
  </g>
  </svg>`
      doneChildren.push(copy)
    }
  })

  container.replaceChildren(...children)
  doneContainer.replaceChildren(...doneChildren)
}

function isOverdue(date) {
  return (new Date() > date)
}

function set_todo(id) {
  let todo = localStorage.getItem(id)
  todo = JSON.parse(todo)
  todo.done = !todo.done
  localStorage.setItem(id, JSON.stringify(todo))
  retrieve_data()
}

function set_sub_todo(todoId, subTodoId, checkElement) {
  let todo = localStorage.getItem(todoId)
  todo = JSON.parse(todo)

  todo.subitem[subTodoId].done = !todo.subitem[subTodoId].done

  localStorage.setItem(todoId, JSON.stringify(todo))
  checkElement.innerHTML = (todo.subitem[subTodoId].done) ? `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        width="18px" height="18px" viewBox="0 0 40 40" style="enable-background:new 50 50 50 40;" xml:space="preserve">
    <g>
      <path fill="gray" d="M20,0C8.974,0,0,8.973,0,20c0,11.027,8.974,20,20,20c11.029,0,20-8.973,20-20C40,8.973,31.029,0,20,0z M28.818,17.875
        l-8.562,8.564c-0.596,0.595-1.377,0.893-2.158,0.893c-0.779,0-1.561-0.298-2.156-0.893l-4.758-4.758
        c-1.191-1.191-1.191-3.124,0-4.313c1.191-1.192,3.121-1.192,4.314,0l2.6,2.6l6.408-6.407c1.188-1.189,3.123-1.189,4.312,0
        C30.01,14.752,30.01,16.684,28.818,17.875z"/>
    </g>
    </svg>` : ''
}

function save_to_local_storage() {

  fetch('dummydata.json')
    .then(response => response.json())
    .then(data => {
      data.objects.map(todo => {
        todo.done = (todo.done == 'True') ? true : false
        localStorage.setItem(todo.id, JSON.stringify(todo))
      })
    })

}

// add_sub_todo(20)

function add_sub_todo(id, title) {
  let todo = localStorage.getItem(id)
  todo = JSON.parse(todo)

  let subTodo = (todo.subitem) ? [...todo.subitem] : []

  todo = {
    ...todo,
    subitem: [
      ...subTodo,
      {
        title: title,
        done: false
      }
    ]
  }

  todo = JSON.stringify(todo)

  localStorage.setItem(id, todo)
}
