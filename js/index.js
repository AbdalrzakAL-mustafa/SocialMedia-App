// For Pagination
let currentPage = 1;
let lastPage = 1;

let postIDClickedToEdit = null;
setupUI();

/* =============================== > Start Infinite Scroll < =========================  */
window.addEventListener("scroll", function () {
  let endOfPage =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight;

  if (endOfPage && currentPage < lastPage) {
    getAllPosts(false, ++currentPage);
  }
});
/* =============================== > End Infinite Scroll < ===========================  */

/* =============================== > Start Get Posts < ===============================  */
function getAllPosts(reload = true, pageNumber = 1) {
  loaderToggle(true);
  axios
    .get(`${baseUrl}/posts?limit=10&page=${pageNumber}`)
    .then((response) => {
      let posts = response.data.data;

      // Unpacking the Posts div in all cases except for the pagination case
      if (reload) {
        document.getElementById("posts").innerHTML = "";
      }

      // Set value to "lastPage"
      lastPage = response.data.meta.last_page;

      for (let post of posts) {
        // Show the delete and edit button only if the user is the owner of this post
        let editBtnElement = "";
        let deleteBtnElement = "";

        let user = JSON.parse(localStorage.getItem("user"));
        let postAuthorId = post.author.id;
        let isPostOwner = user != null && user.id === postAuthorId;

        if (isPostOwner) {
          editBtnElement = `
            ​<button class='btn btn-secondary' onclick="openEditPostModal('${encodeURIComponent(
              JSON.stringify(post)
            )}')" class="btn btn-secondary">Edit Post</button>`;

          deleteBtnElement = ` 
              <button id="deletePostBtn" data-id="${post.id}" class="btn btn-danger"
               data-bs-toggle="modal" data-bs-target="#deletePostModal">Delete Post </button>
            `;
        }

        // Create a Post
        let postContent = `
          <div class="card mb-2 shadow">
          <div class="card-header">
            <div onclick="goToProfile(${
              post.author.id
            })" style="cursor: pointer;width: fit-content">
                  <img
                  src=${post.author.profile_image}
                  alt="Profile-Img"
                  style="width: 40px; height: 40px"
                  class="rounded-circle border border-2"
                />
                <b>${post.author.username}</b>
            </div>
          </div>
          <div class="card-body">
            <img
              src=${post.image}
              class="w-100"
              alt="Post-Img"
              style="height: 300px"
            />
            <h6 class="mt-2" style="color: #777">${post.created_at}</h6>
  
            <h5 class="card-title">${post.title ? post.title : ""}</h5>
            <p class="card-text">
            ${post.body}
            </p>
  
            <hr />
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="16"
                fill="currentColor"
                class="bi bi-pen"
                viewBox="0 0 16 16"
              >
                <path
                  d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"
                />
              </svg>
              <span>(${post.comments_count}) Comments</span>
              <span id="post-tags-${post.id}"> </span>
              <div style="float: right;"> 
              <button
                onclick="goToPostDetails(${post.id})"
                class="btn btn-secondary me-1"
              >
              Show Post Details
              </button>

              ${isPostOwner ? editBtnElement : ""}
              ${isPostOwner ? deleteBtnElement : ""}
              </div>
            </div>
          </div>
        </div>
          `;

        document.getElementById("posts").innerHTML += postContent;

        // Add Tags to a post
        let tags = post.tags;
        if (tags.length > 0) {
          for (let tag of tags) {
            let tagElement = `<button class="btn btn-sm rounded-4 me-2"
            style="background-color: gray; color: #fff">${tag.name}</button>`;
            document.getElementById(`post-tags-${post.id}`).innerHTML +=
              tagElement;
          }
        }
      }
      //End For Loop
    })
    .catch((error) => {
      showAlert("Create Post Errors", `${error}`, false);
    })
    .finally(() => {
      loaderToggle(false);
    });
}
getAllPosts((reload = true), (pageNumber = 1));
/* =============================== > End Get Posts < =================================  */
