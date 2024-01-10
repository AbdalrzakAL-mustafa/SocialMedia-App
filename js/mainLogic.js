const baseUrl = "https://tarmeezacademy.com/api/v1";

// Setup UI Function

function setupUI() {
  // Get Buttons
  let loginBtn = document.getElementById("login");
  let logoutBtn = document.getElementById("logout");
  let registerBtn = document.getElementById("register");
  let userInfoDiv = document.querySelector(".user-info");

  let createPostBtn = document.getElementById("create-post");

  // Get Token
  let token = window.localStorage.getItem("token");

  if (token == null) {
    // user Not logged in

    loginBtn.style.display = "inline-block";
    registerBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";

    if (createPostBtn != null) {
      createPostBtn.style.display = "none";
    }

    // Hid User Picture and name
    userInfoDiv.classList.remove("d-inline-block");
    userInfoDiv.classList.add("d-none");
  } else {
    // user logged in

    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    if (createPostBtn != null) {
      createPostBtn.style.display = "block";
    }

    // Show User Picture and name
    let userObj = JSON.parse(window.localStorage.getItem("user"));
    let userName = userObj.username;
    let userPic = userObj.profile_image;

    userInfoDiv.classList.remove("d-none");
    userInfoDiv.classList.add("d-inline-block");

    userInfoDiv.innerHTML = `
            <img
              src=${userPic}
              alt="Profile-Img"
              style="width: 40px; height: 40px"
              class="rounded-circle border border-2"
            />
            <span class="ms-2 fw-bold">${userName}</span>
            `;
  }
}

/* =============================== > Start Register User  < ==========================  */
// Register A New user
function registerUser() {
  let name = document.getElementById("register-name-input").value;
  let userName = document.getElementById("register-username-input").value;
  let email = document.getElementById("register-email-input").value;
  let password = document.getElementById("register-password-input").value;
  // Select first image was uploaded
  let userImg = document.getElementById("userImg-input").files[0];

  const formData = new FormData();
  formData.append("name", name);
  formData.append("username", userName);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("image", userImg);

  loaderToggle(true);
  axios
    .post(`${baseUrl}/register`, formData)
    .then((response) => {
      // Save The User and the Token into LocalStorage
      window.localStorage.setItem("user", JSON.stringify(response.data.user));
      window.localStorage.setItem("token", response.data.token);

      // Show Alert For User
      showAlert("Register", "You have been registered successfully");

      // Hide Login and Register Buttons Then Show Logout button
      setupUI();
    })
    .catch((error) => {
      let errorMessage = "";
      let errors = error.response.data.errors;
      for (const key in errors) {
        errorMessage += `${errors[key]}\n`;
      }
      showAlert("Register Errors", `${errorMessage}`, false);
    })
    .finally(() => {
      loaderToggle(false);
    });
}
/* =============================== > End Register User  < ============================  */

/* =============================== > Start User Login & Logout  < ====================  */
// Login
function loginBtnHandler() {
  let userName = document.getElementById("username-input").value;
  let password = document.getElementById("password-input").value;
  const params = {
    username: userName,
    password: password,
  };

  loaderToggle(true);
  axios
    .post(`${baseUrl}/login`, params)
    .then((response) => {
      // Save The User and the Token into LocalStorage
      window.localStorage.setItem("user", JSON.stringify(response.data.user));
      window.localStorage.setItem("token", response.data.token);

      // Hide Login and Register Buttons Then Show Logout button
      setupUI();

      showAlert("Login", "You have been logged in successfully");

      // Reload The Page
      window.location.reload();
    })
    .catch((error) => {
      showAlert("Login Error", `${error}`, false);
    })
    .finally(() => {
      loaderToggle(false);
    });
}

// Logout User
function logoutHandler() {
  // Remove Token and User Data Form LocalStorage
  window.localStorage.removeItem("user");
  window.localStorage.removeItem("token");

  // Hide Logout Button Then Show Login and Register Buttons
  setupUI();

  showAlert("Logout", "You have been logged out successfully");

  // Reload The Page
  window.location.reload();
}

/* =============================== > End User Login & Logout  < ======================  */

// Show Alert For User
function showAlert(state, message, flag = true) {
  if (flag) {
    document.querySelector(".toast-container").classList.remove("text-danger");
    document.querySelector(".toast-container").classList.add("text-success");
  } else {
    document.querySelector(".toast-container").classList.remove("text-success");
    document.querySelector(".toast-container").classList.add("text-danger");
  }
  document.querySelector(".toast-header strong").innerHTML = state;

  document.querySelector(".toast-body").innerHTML = message;
  let alert = document.querySelector(".toast");
  let alertBSInstance = new bootstrap.Toast(alert);
  alertBSInstance.show();
}

/* =============================== > Start Create Post < ================================  */

// Create Post Function
function createNewPost(buttonClicked) {
  let modalInputId = "post";
  let url = `${baseUrl}/posts`;
  let messageSuccess = "The post has been created successfully";

  let formData = new FormData();

  //Check If "Edit Post Btn" Clicked Or "Create Post Btn" Clicked
  let editPostBtnClicked = buttonClicked.id === "edit-post-btn";

  if (editPostBtnClicked) {
    modalInputId = "edit-post";
    url = `${baseUrl}/posts/${postIDClickedToEdit}`;
    formData.append("_method", "put");
    messageSuccess = "The post has been Updated successfully";
  }
  // Get Values From Modal Inputs
  let postTitle = document.getElementById(`${modalInputId}-title`).value;
  let postBody = document.getElementById(`${modalInputId}-body`).value;
  let postImage = document.getElementById(`${modalInputId}-image`).files[0];

  const token = window.localStorage.getItem("token");

  // Request Data
  formData.append("title", postTitle);
  formData.append("body", postBody);
  formData.append("image", postImage);

  let headers = {
    authorization: `Bearer ${token}`,
  };

  loaderToggle(true);
  axios
    .post(url, formData, { headers: headers })
    .then((response) => {
      // Show All Posts After The Post Was Created
      getAllPosts();
      showAlert("Create || Update Post", `${messageSuccess}`);
    })
    .catch((error) => {
      let errorMessage = error.response.data.message;

      showAlert("Create || Update Post Errors", `${errorMessage}`, false);
    })
    .finally(() => {
      loaderToggle(false);
    });
}
/* =============================== > End Create Post < ==================================  */

/* =============================== > Start Edit And Delete Posts < ======================  */
// Ope Edit Post Modal Function
function openEditPostModal(postObj) {
  let post = JSON.parse(decodeURIComponent(postObj));
  let postId = post.id;
  let postTitle = post.title;
  let postBody = post.body;

  postIDClickedToEdit = postId;

  // Set Post's Data Into Edit Modal Inputs
  let titleEditPostModal = (document.getElementById("edit-post-title").value =
    postTitle);
  let bodyEditPostModal = (document.getElementById("edit-post-body").value =
    postBody);

  // Open EditPost Modal
  const editPostModal = new bootstrap.Modal(
    document.getElementById("editPost-modal"),
    {
      keyboard: false,
    }
  );
  editPostModal.toggle();
}

function deletePostHandler(isDeleteBtnClicked) {
  let deleteBtn = document.getElementById("deletePostBtn");
  let deletePostId = deleteBtn.dataset.id;

  // If User clicked on "Yes" Button on "DeletePostModal"
  if (isDeleteBtnClicked) {
    let token = window.localStorage.getItem("token");
    let url = `${baseUrl}/posts/${deletePostId}`;
    let headers = {
      authorization: `Bearer ${token}`,
    };

    loaderToggle(true);
    axios
      .delete(url, { headers })
      .then((response) => {
        // getAllPosts((reload = true), (pageNumber = 1));
        showAlert("Delete A Post", "The post have been deleted successfully");
        window.location.reload();
      })
      .catch((error) => {
        showAlert("Delete A Post", `${error}`, false);
      })
      .finally(() => {
        loaderToggle(false);
      });
  }
}
/* =============================== > End Edit And Delete Posts < ==========================  */

/* =============================== > Start Move between pages  < ==========================  */
// Go To PostDetails Page
function goToPostDetails(postId) {
  window.location = `postDetails.html?postId=${postId}`;
}

// Go To Profile Page
function goToProfile(userID) {
  window.location = `profile.html?userId=${userID}`;
}
/* =============================== > End Move between pages  < =============================  */

/* =============================== > Start Sheared HTML Elements < =========================  */
//  Add The Elements To All Pages
// Add Loader Element
function addLoaderElement() {
  let loader = `
          <div id="loader">
          <div class="lds-spinner">
            <div></div><div></div><div></div><div></div><div></div><div></div>
            <div></div><div></div><div></div><div></div><div></div><div></div>
          </div>
        </div>
      `;
  document.querySelector(".app").innerHTML += loader;
}
addLoaderElement();

function loaderToggle(show = false) {
  let loaderElement = document.getElementById("loader");
  if (show) {
    loaderElement.style.display = "flex";
  } else {
    loaderElement.style.display = "none";
  }
}
loaderToggle(false);
// End Adding Loader Element
/* =============================== > End Sheared HTML Elements < ===========================  */
