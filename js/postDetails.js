setupUI();
// ================================ Start Show Post Details ================================
function getPost() {
  // Get PostID From URL Query Params
  let urlParams = new URLSearchParams(window.location.search);
  let postId = urlParams.get("postId");

  document.getElementById("post-details").innerHTML = "";

  loaderToggle(true);
  axios
    .get(`${baseUrl}/posts/${postId}`)
    .then((response) => {
      const post = response.data.data;
      const author = post.author;

      //  Collect All Tags into one variable
      let tags = post.tags;
      let tagElements = "";
      if (tags.length > 0) {
        for (let tag of tags) {
          tagElements += `<button class="btn btn-sm rounded-4 me-2"
                          style="background-color: gray; color: #fff">${tag.name}</button>`;
        }
      }

      // Collect all comments into one variable
      let comments = post.comments;
      let commentsContent = "";
      for (let comment of comments) {
        commentsContent += `
              <div class="comment m-2">
              <img
                src=${comment.author.profile_image}
                alt="Profile-Img"
                style="width: 40px; height: 40px"
                class="rounded-circle border border-2"
              />
              <b>${comment.author.username}</b>
              <p class="comment-body mt-1">
              ${comment.body}
              </p>
              </div>
              <hr/>
              `;
      }

      // Create a Post
      let postContent = `
    <div class="card mb-2 shadow">
        <div class="card-header">
            <img
            src="${author.profile_image}"
            alt="Profile-Img"
            style="width: 40px; height: 40px"
            class="rounded-circle border border-2"
            />
            <b style="cursor: pointer;" onclick="goToProfile(${
              post.author.id
            })">${author.username}</b>
        </div>
        <div class="card-body">
            <img
            src="${post.image}"
            class="w-100"
            alt="Post-Img"
            style="height: 300px"
            />
            <h6 class="mt-2" style="color: #777">${post.created_at}</h6>

            <h5 class="card-title">${post.title ? post.title : ""}</h5>
            <p class="card-text">${post.body}</p>

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
            <span> ${tagElements} </span>
            </div>
            <hr />
            <!-- Start Comments -->
            <div id="comments" style="background-color: #f8efef; padding: 5px">
            ${commentsContent}
            </div>
            <div class="mb-3" id="addCommentContainer" style = "display:flex">
            <input
                type="text"
                id="new-comment-content"
                class="w-100 p-1"
                style="outline: 0"
                placeholder="add your comment here.."
            />
            <button
                class="btn btn-outline-primary"
                onclick="createNewComment(${post.id})"
            >
                Send
            </button>
            <!-- end Comments -->
            </div>
         </div>
        </div>
                           `;

      document.getElementById("post-author").innerHTML = `${author.name} Post`;

      document.getElementById("post-details").innerHTML += postContent;
    })

    .catch((error) => {
      showAlert("Post Error", `${error}`, false);
    })
    .finally(() => {
      loaderToggle(false);
    });
}
getPost();

/* ================================ End Show Post Details ================================== */

/* ================================ Start Create New Comment =============================== */

// Create New Comment on the specific post
function createNewComment(postId) {
  let token = window.localStorage.getItem("token");
  let newCommentContent = document.getElementById("new-comment-content").value;

  let params = {
    body: newCommentContent,
  };

  let headers = {
    authorization: `Bearer ${token}`,
  };

  let url = `${baseUrl}/posts/${postId}/comments`;

  loaderToggle(true);
  axios
    .post(url, params, { headers: headers })
    .then((response) => {
      showAlert("Add New Comment", "The Comment Has been Created Successfully");
      // Reshow All Comments
      getPost();
    })
    .catch((error) => {
      if (localStorage.getItem("token") == null) {
        showAlert(
          "Unauthenticated",
          "Please log in or create an account so you can add a comment",
          false
        );
      } else {
        showAlert("Add Comment Error", `${error.response.data.message}`, false);
      }
    })
    .finally(() => {
      loaderToggle(false);
    });
}
/* ================================ End Create New Comment ================================ */
