const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function generateId() {
    return +new Date();
}

function generateBookObject(id, judul, penulis, tahunRilis, isCompleted) {
    return { id, judul, penulis, tahunRilis, isCompleted };
}

document.addEventListener(RENDER_EVENT, function () {
    const rakBelumSelesai = document.getElementById('incompleteBookList');
    rakBelumSelesai.innerHTML = '';

    const rakSelesai = document.getElementById('completeBookList');
    rakSelesai.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted) {
            rakBelumSelesai.append(bookElement);
        } else {
            rakSelesai.append(bookElement);
        }
    }
});

function addBook() {
    const inputJudul = document.getElementById('bookFormTitle').value;
    const inputPenulis = document.getElementById('bookFormAuthor').value;
    const inputTahunRilis = document.getElementById('bookFormYear').value;
    const inputStatusBuku = document.getElementById('bookFormIsComplete').checked;

    const generateID = generateId();
    const bookObject = generateBookObject(generateID, inputJudul, inputPenulis, inputTahunRilis, inputStatusBuku);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    document.getElementById('bookFormTitle').value = '';
    document.getElementById('bookFormAuthor').value = '';
    document.getElementById('bookFormYear').value = '';
    document.getElementById('bookFormIsComplete').checked = false;
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('bookForm');
    submitForm.addEventListener('submit', function (e) {
        e.preventDefault();
        addBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        searchBook();
    });
});

function makeBook(bookObject) {
    const bookItemContainer = document.createElement('div');
    bookItemContainer.setAttribute('data-bookid', bookObject.id);
    bookItemContainer.setAttribute('data-testid', 'bookItem');

    const textJudul = document.createElement('h3');
    textJudul.setAttribute('data-testid', 'bookItemTitle');
    textJudul.innerText = bookObject.judul;

    const textPenulis = document.createElement('p');
    textPenulis.setAttribute('data-testid', 'bookItemAuthor');
    textPenulis.innerText = `Penulis: ${bookObject.penulis}`;

    const textTahunRilis = document.createElement('p');
    textTahunRilis.setAttribute('data-testid', 'bookItemYear');
    textTahunRilis.innerText = `Tahun: ${bookObject.tahunRilis}`;

    bookItemContainer.append(textJudul, textPenulis, textTahunRilis);

    const containerActionButton = document.createElement('div');
    containerActionButton.setAttribute('id', 'actionButton');

    const toggleButton = document.createElement('button');
    toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    toggleButton.innerText = bookObject.isCompleted ? "Belum Selesai Dibaca" : "Selesai Dibaca";
    toggleButton.style.backgroundColor = 'rgb(22, 196, 127)';

    toggleButton.addEventListener("click", () => {
        if (bookObject.isCompleted) {
            addToRakBelumSelesai(bookObject.id);
        } else {
            addToRakSelesai(bookObject.id);
        }
    });

    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.style.backgroundColor = 'rgb(249, 56, 39)';
    deleteButton.innerText = "Hapus Buku";

    deleteButton.addEventListener('click', () => {
        const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus buku "${bookObject.judul}"?`);
        if (confirmDelete) {
            DeleteBookFromRak(bookObject.id);
        }
    });

    containerActionButton.append(toggleButton, deleteButton);
    bookItemContainer.append(containerActionButton);

    return bookItemContainer;
}

function findBook(bookId) {
    return books.find(book => book.id === bookId) || null;
}

function findBookIndex(bookId) {
    return books.findIndex(book => book.id === bookId);
}

function addToRakBelumSelesai(bookId) {
    const book = findBook(bookId);
    if (book == null) return;

    book.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addToRakSelesai(bookId) {
    const book = findBook(bookId);
    if (book == null) return;

    book.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function DeleteBookFromRak(bookId) {
    const bookIndex = findBookIndex(bookId);
    if (bookIndex === -1) return;

    books.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function searchBook() {
    const searchInput = document.getElementById('searchBookTitle').value.toLowerCase();
    const rakBelumSelesai = document.getElementById('incompleteBookList');
    const rakSelesai = document.getElementById('completeBookList');

    rakBelumSelesai.innerHTML = '';
    rakSelesai.innerHTML = '';

    if (searchInput === '') {
        document.dispatchEvent(new Event(RENDER_EVENT));
        return;
    }

    const filteredBooks = books.filter((book) => 
        book.judul.toLowerCase().includes(searchInput)
    );

    if (filteredBooks.length === 0) {
        alert('Buku tidak ditemukan!');
        return;
    }

    for (const bookItem of filteredBooks) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted) {
            rakBelumSelesai.append(bookElement);
        } else {
            rakSelesai.append(bookElement);
        }
    }
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
    }
}

function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}
