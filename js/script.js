const books = []
const RENDER_EVENT = 'render-books'
const SAVED_EVENT = 'saved-books'
const STORAGE_KEY = 'BOOKSHELF_APPS'

const handleSubmitBook = document.getElementById('form-add-book')
const inputTitle = document.getElementById('input-title')
const inputAuthor = document.getElementById('input-author')
const inputYear = document.getElementById('input-year')
const bookRead = document.getElementById('book-read')
const bookNotRead = document.getElementById('book-not-read')
const btnReadDisplay = document.getElementById('btn-read')
const btnNotReadDisplay = document.getElementById('btn-not-read')
const inputSearch = document.getElementById('input-search')

const body = document.getElementById('modal')

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser Tidak Mendukung')
    return false
  }

  return true
}

document.addEventListener('DOMContentLoaded', () => {
  handleSubmitBook.addEventListener('submit', (e) => {
    e.preventDefault()
    addBook()
  })

  if (isStorageExist()) {
    loadData()
  }

  createModal()
})

document.addEventListener(RENDER_EVENT, () => {
  bookRead.innerHTML = ''
  bookNotRead.innerHTML = ''

  for (const book of books) {
    const bookElm = makeList(book)
    if (!book.isComplete) {
      bookNotRead.append(bookElm)
    } else {
      bookRead.append(bookElm)
    }
  }
})

btnNotReadDisplay.addEventListener('click', () => {
  bookNotRead.removeAttribute('hidden')
  btnNotReadDisplay.classList.add('active')
  bookRead.setAttribute('hidden', true)
  btnReadDisplay.classList.remove('active')
})

btnReadDisplay.addEventListener('click', () => {
  bookRead.removeAttribute('hidden')
  btnReadDisplay.classList.add('active')
  bookNotRead.setAttribute('hidden', true)
  btnNotReadDisplay.classList.remove('active')
})

inputSearch.addEventListener('keyup', () => {
  searchBook()
})

function addBook() {
  const bookId = +new Date()
  const bookObject = convertToObject(bookId, inputTitle.value, inputAuthor.value, inputYear.value, false)

  if (bookObject.status === 'success') {
    books.push(bookObject.data)
  
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
    resetInput()
  } else {
    return bookObject.message
  }

  createModal()
}

function makeList(bookObject) {
  const {id, title, author, year, isComplete} = bookObject

  const card = document.createElement('div')
  const cardList = document.createElement('div')
  const bookDetails = document.createElement('div')
  const bookAction = document.createElement('div')
  const titleBook = document.createElement('h4')
  const authorBook = document.createElement('p')
  const yearBook = document.createElement('p')
  
  card.classList.add('card', 'book-list')
  cardList.classList.add('card-list')
  bookDetails.classList.add('book-details')
  bookAction.classList.add('action-group')

  bookDetails.setAttribute('id', `book-${id}`)

  titleBook.innerText = `${title}`
  authorBook.innerText = `Penulis: ${author}`
  yearBook.innerText = `Tahun: ${year}`
  
  bookDetails.append(titleBook, authorBook, yearBook)
  cardList.append(bookDetails, bookAction)
  card.append(cardList)
  
  if (isComplete) {
    const btnDelete = document.createElement('button')
    const btnSetNotFinished = document.createElement('button')
    const imgSetNotFinished = document.createElement('img')
    const imgBot = document.createElement('img')
    const imgTop = document.createElement('img')

    btnDelete.classList.add('btn', 'btn-delete')
    btnSetNotFinished.classList.add('btn', 'btn-set-not-finished')
    imgBot.classList.add('img-bot')
    imgTop.classList.add('img-top')

    imgSetNotFinished.setAttribute('src', './assets/images/check.png')
    imgBot.setAttribute('src', './assets/images/circle-trash.png')
    imgTop.setAttribute('src', './assets/images/circle-trash-hover.png')

    btnSetNotFinished.addEventListener('click', () => {
      setBookNotComplete(id)
    })
    btnDelete.addEventListener('click', () => {
      openModal(id)
    })

    btnSetNotFinished.append(imgSetNotFinished)
    btnDelete.append(imgBot, imgTop)
    bookAction.append(btnSetNotFinished, btnDelete)
  } else {
    const btnDelete = document.createElement('button')
    const btnSetFinished = document.createElement('button')
    const imgSetFinished = document.createElement('img')
    const imgBot = document.createElement('img')
    const imgTop = document.createElement('img')

    btnDelete.classList.add('btn', 'btn-delete')
    btnSetFinished.classList.add('btn', 'btn-set-finished')
    imgBot.classList.add('img-bot')
    imgTop.classList.add('img-top')

    imgSetFinished.setAttribute('src', './assets/images/circle.png')
    imgBot.setAttribute('src', './assets/images/circle-trash.png')
    imgTop.setAttribute('src', './assets/images/circle-trash-hover.png')

    btnSetFinished.addEventListener('click', () => {
      setBookComplete(id)
    })
    btnDelete.addEventListener('click', () => {
      openModal(id)
    })

    btnSetFinished.append(imgSetFinished)
    btnDelete.append(imgBot, imgTop)
    bookAction.append(btnSetFinished, btnDelete)
  }

  return card
}

function convertToObject(id, title, author, year, isComplete) {
  if (title === '' || author === '' || year === '') {
    return ({
      status: 'failed',
      message: alert('Silakan isi semua input')
    })
  } else {
    return ({
      status: 'success',
      data: {
        id,
        title,
        author,
        year,
        isComplete
      }
    })
  }
}

function setBookComplete(bookId) {
  const getBook = books.find(book => book.id === bookId)

  if (getBook === null) return

  getBook.isComplete = true

  document.dispatchEvent(new Event(RENDER_EVENT))
  saveData()
}

function setBookNotComplete(bookId) {
  const getBook = books.find(book => book.id === bookId)

  if (getBook === null) return

  getBook.isComplete = false

  document.dispatchEvent(new Event(RENDER_EVENT))
  saveData()
}

function deleteBook(bookId) {
  const bookTarget = books.findIndex(book => book.id === bookId)

  books.splice(bookTarget, 1)

  document.dispatchEvent(new Event(RENDER_EVENT))
  saveData()
  closeModal(bookId)
}

function saveData() {
  if (isStorageExist()) {
    const parse = JSON.stringify(books)
    localStorage.setItem(STORAGE_KEY, parse)
    document.dispatchEvent(new Event(RENDER_EVENT))
  }
}

function loadData() {
  const getData = localStorage.getItem(STORAGE_KEY)
  const data = JSON.parse(getData)

  if (getData !== null) {
    for (const book of data) {
      books.push(book)
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT))
}

function resetInput() {
  inputTitle.value = ''
  inputAuthor.value = ''
  inputYear.value = ''
}

function searchBook() {
  const list = document.querySelectorAll('.book-list')
  const q = inputSearch.value.toUpperCase()
    
  for (let i = 0; i < list.length; i++) {
    let title = list[i].getElementsByTagName('h4')[0].innerText

    if (title.toUpperCase().indexOf(q) > -1) {
      list[i].style.display = ''
    } else {
      list[i].style.display = 'none'
    }
  }
}

function createModal() {
  const container = document.getElementById('modal')
  if (books.length !== 0) {
    for (const book of books) {
      
      const modal = document.createElement('div')
      const modalContent = document.createElement('div')
      const card = document.createElement('div')
      const modalTitle = document.createElement('h2')
      const modalText = document.createElement('p')
      const clearfix = document.createElement('div')
      const btnCancel = document.createElement('button')
      const btnDelete = document.createElement('button')

      modal.classList.add('modal')
      modal.setAttribute('id', `modal-${book.id}`)

      modalContent.classList.add('modal-content')
      card.classList.add('card')
      modalTitle.innerText = 'Hapus Buku'
      modalText.innerText = 'Yakin hapus buku ini?'
      clearfix.classList.add('clearfix')
      btnCancel.classList.add('btn', 'cancel-button')
      btnCancel.innerText = 'Batal'
      btnDelete.classList.add('btn', 'delete-button')
      btnDelete.innerText = 'Hapus'

      clearfix.append(btnCancel, btnDelete)
      card.append(modalTitle, modalText, clearfix)
      modalContent.append(card)
      modal.append(modalContent)

      btnCancel.addEventListener('click', () => {
        closeModal(book.id)
      })
      btnDelete.addEventListener('click', () => {
        deleteBook(book.id)
      })
      deleteModal(book.id)

      container.append(modal)
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT))
  return container
}

function openModal(id) {
  const modal = document.querySelector(`#modal-${id}`)

  modal.style.display = 'block'
}

function closeModal(id) {
  const modal = document.querySelector(`#modal-${id}`)

  modal.style.display = 'none'
}

function deleteModal(bookId) {
  const allModal = document.getElementsByClassName('modal')

  for (let i = 0; i < allModal.length; i++) {
    const modals = document.getElementById(`modal-${bookId}`)
    if (modals?.length > 1) {
      console.log(modals)
    }
  }
}