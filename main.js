// Inisialisasi Variabel
let books = [];
let editingBookId = null;

// DOM Elements
const bookForm = document.getElementById("bookForm");
const searchForm = document.getElementById("searchBook");
const incompleteBookList = document.getElementById("incompleteBookList");
const completeBookList = document.getElementById("completeBookList");
const searchBookTitle = document.getElementById("searchBookTitle");
const bookFormTitle = document.getElementById("bookFormTitle");
const bookFormAuthor = document.getElementById("bookFormAuthor");
const bookFormYear = document.getElementById("bookFormYear");
const bookFormIsComplete = document.getElementById("bookFormIsComplete");
const bookFormSubmit = document.getElementById("bookFormSubmit");
const bookFormSubmitText = bookFormSubmit.querySelector("span");

// Event listener
document.addEventListener("DOMContentLoaded", () => {
  loadBooksFromStorage();
  renderBooks();
  updateBookFormButton();
});

bookForm.addEventListener("submit", handleFormSubmit);
searchForm.addEventListener("submit", handleSearchSubmit);
bookFormIsComplete.addEventListener("change", updateBookFormButton);

// Fungsi update teks tombol submit
function updateBookFormButton() {
  bookFormSubmitText.textContent = bookFormIsComplete.checked
    ? "Selesai dibaca"
    : "Belum selesai dibaca";
}

// Fungsi menangani submit form buku
function handleFormSubmit(event) {
  event.preventDefault();

  const title = bookFormTitle.value;
  const author = bookFormAuthor.value;
  const year = parseInt(bookFormYear.value);
  const isComplete = bookFormIsComplete.checked;

  if (editingBookId) {
    // Edit buku yang sudah ada
    updateBook(editingBookId, { title, author, year, isComplete });
    editingBookId = null;
    bookFormSubmitText.textContent = "Masukkan Buku ke rak";
    bookFormSubmit.appendChild(bookFormSubmitText);
  } else {
    // Tambah buku baru
    addBook({ title, author, year, isComplete });
  }

  // reset
  bookForm.reset();
  updateBookFormButton();
}

// Fungsi menangani submit pencarian buku
function handleSearchSubmit(event) {
  event.preventDefault();
  renderBooks(searchBookTitle.value);
}

// Fungsi untuk menyimpan buku ke local storage
function saveBooks() {
  localStorage.setItem("books", JSON.stringify(books));
}

// Fungsi untuk memuat buku dari local storage
function loadBooksFromStorage() {
  const storedBooks = localStorage.getItem("books");
  books = storedBooks ? JSON.parse(storedBooks) : [];
}

// Fungsi untuk menambahkan buku baru
function addBook(book) {
  const newBook = {
    id: `${new Date().getTime()}`,
    title: book.title,
    author: book.author,
    year: book.year,
    isComplete: book.isComplete,
  };

  books.push(newBook);
  saveBooks();
  renderBooks();
}

// Fungsi untuk memperbarui buku yang sudah ada
function updateBook(bookId, newData) {
  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      title: newData.title,
      author: newData.author,
      year: newData.year,
      isComplete: newData.isComplete,
    };

    saveBooks();
    renderBooks();
  }
}

// Fungsi untuk mengisi form dengan data buku yang diedit
function editBook(bookId) {
  const book = books.find((book) => book.id === bookId);

  if (book) {
    bookFormTitle.value = book.title;
    bookFormAuthor.value = book.author;
    bookFormYear.value = book.year;
    bookFormIsComplete.checked = book.isComplete;
    updateBookFormButton();

    editingBookId = bookId;
    bookFormSubmitText.textContent = "Edit buku";
    bookFormSubmit.appendChild(document.createElement("span"));
    bookFormSubmitText = bookFormSubmit.querySelector("span");
    bookFormSubmitText.textContent = book.isComplete
      ? "Selesai dibaca"
      : "Belum selesai dibaca";
  }

  // Scroll ke form
  bookForm.scrollIntoView({ behavior: "smooth" });
}

// Fungsi untuk toggle status buku (ditambahkan karena dipanggil tapi belum didefinisikan)
function toggleBookStatus(bookId) {
  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books[index].isComplete = !books[index].isComplete;
    saveBooks();
    renderBooks();
  }
}

// Fungsi untuk menghapus buku (ditambahkan karena dipanggil tapi belum didefinisikan)
function deleteBook(bookId) {
  books = books.filter((book) => book.id !== bookId);
  saveBooks();
  renderBooks();
}

// fungsi untuk membuat element buku
function createBookElement(book) {
  const bookItem = document.createElement("div");
  bookItem.setAttribute("data-bookid", book.id);
  bookItem.setAttribute("data-testid", "bookItem");
  bookItem.classList.add("book_item");

  const title = document.createElement("h3");
  title.setAttribute("data-testid", "bookItemTitle");
  title.textContent = book.title;

  const author = document.createElement("p");
  author.setAttribute("data-testid", "bookItemAuthor");
  author.textContent = `Penulis: ${book.author}`;

  const year = document.createElement("p");
  year.setAttribute("data-testid", "bookItemYear");
  year.textContent = `Tahun: ${book.year}`;

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("action-buttons");

  const toggleButton = document.createElement("button");
  toggleButton.setAttribute("data-testid", "bookItemIsCompleteButton");
  toggleButton.textContent = book.isComplete
    ? "Selesai dibaca"
    : "Belum selesai dibaca";
  toggleButton.classList.add("toggle-button");
  toggleButton.addEventListener("click", () => toggleBookStatus(book.id));

  const deleteButton = document.createElement("button");
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
  deleteButton.textContent = "Hapus Buku";
  deleteButton.classList.add("delete-button");
  deleteButton.addEventListener("click", () => {
    const confirmation = confirm(
      `Apakah Anda yakin ingin menghapus buku "${book.title}"?`
    );
    if (confirmation) {
      deleteBook(book.id);
    }
  });

  const editButton = document.createElement("button");
  editButton.setAttribute("data-testid", "bookItemEditButton");
  editButton.textContent = "Edit Buku";
  editButton.classList.add("edit-button");
  editButton.addEventListener("click", () => editBook(book.id));

  actionContainer.appendChild(toggleButton);
  actionContainer.appendChild(deleteButton);
  actionContainer.appendChild(editButton);

  bookItem.appendChild(title);
  bookItem.appendChild(author);
  bookItem.appendChild(year);
  bookItem.appendChild(actionContainer);

  return bookItem;
}

// Fungsi untuk menampilkan daftar buku
function renderBooks(searchKeyword = "") {
  // Bersihkan rak
  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  // Filter buku berdasarkan kata kunci pencarian
  const filteredBooks = searchKeyword
    ? books.filter((book) =>
        book.title.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    : books;

  // Tampilkan buku
  filteredBooks.forEach((book) => {
    const bookElement = createBookElement(book);
    if (book.isComplete) {
      completeBookList.appendChild(bookElement);
    } else {
      incompleteBookList.appendChild(bookElement);
    }
  });

  // Tampilkan pesan jika tidak ada buku
  if (!incompleteBookList.querySelector('[data-testid="bookItem"]')) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "Tidak ada buku yang belum selesai dibaca";
    emptyMessage.classList.add("empty-message");
    incompleteBookList.appendChild(emptyMessage);
  }

  if (!completeBookList.querySelector('[data-testid="bookItem"]')) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "Tidak ada buku yang selesai dibaca";
    emptyMessage.classList.add("empty-message");
    completeBookList.appendChild(emptyMessage);
  }
}
