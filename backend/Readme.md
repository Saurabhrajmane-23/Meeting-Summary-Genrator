## Backend for VCS

### Below are the steps i followed to make this backend.

1. Designed a backend model for the vcs. It contains all the info about variables of backend and how they are interlinked with each other. I used claude ai to create the backend model.

[![](https://mermaid.ink/img/pako:eNqlVcGOmzAQ_RXk07bNpoFNSMJtt1G1l0pVV-2h4uKFCVgFG9lmt2mUfHsHTBIHwiZtuGBmnsfz3oyHNYlEDCQgUUaVWjCaSJqH3MHnuwLphMQNiXN7i4v3uPgGhVBMC7lyAke8ctUP_STynGmERRKohjeQD5LyKG0jraN6IwuuKeNnN-wPSGmDbSyXBW7MCNsDCiqB649RyrLYgD6zDNrxKtsPkIoJbh_eRHkTfMjA7KnLY9RbG0v1fHjSkvHEYXHXViKW0xy6Hsgpy7rmAk94FdIOtcByNFWJ73XbURZxx0FLnaIyLELPzTvLYaIcanTkTEDvPQzUzrc5Zm8V-EINTvOPQUWSFRqVtpwPQmRAucPU1_I5Y5HlqmXHbgdpGe-lpKtt5dpitbKMPgtJMTl1lX4GbNqzLZGxHuTZ2U0_9anWtPr_KWZJLvdLy9-0cgo0Nsu2ajUfIa_SJAeZwI3h8U_Um-wupI73M-1ac1CKJtDmVfW56LaDOXHbzIeLWsFstG7_1lnihzomumDL5VHdJbyA1D3E7VlyIfuC6hPsqzGERM6KVU-_Ku1ub0TtvtixsZLsZ3Fl-qWs6vB4nOy5pj5RkRezaBXlkSl7lG3IgGCv4nSN8YdaJx4SHId4o0iAy5jKXyEJeYXD_hFPKx6RQMsSBkSKMklJsKSZwi9zC5q_8Q5SUP5TiHwPgrhK_Evz-65eNYYEa_KbBOPJeDh3vak7n3r-xPcmA7IiwZ07nI08fz6-80b-dDZ1NwPypw46Gs58zx_53shz_cl0Np9v_gKdh2ia?type=png)](https://mermaid.live/edit#pako:eNqlVcGOmzAQ_RXk07bNpoFNSMJtt1G1l0pVV-2h4uKFCVgFG9lmt2mUfHsHTBIHwiZtuGBmnsfz3oyHNYlEDCQgUUaVWjCaSJqH3MHnuwLphMQNiXN7i4v3uPgGhVBMC7lyAke8ctUP_STynGmERRKohjeQD5LyKG0jraN6IwuuKeNnN-wPSGmDbSyXBW7MCNsDCiqB649RyrLYgD6zDNrxKtsPkIoJbh_eRHkTfMjA7KnLY9RbG0v1fHjSkvHEYXHXViKW0xy6Hsgpy7rmAk94FdIOtcByNFWJ73XbURZxx0FLnaIyLELPzTvLYaIcanTkTEDvPQzUzrc5Zm8V-EINTvOPQUWSFRqVtpwPQmRAucPU1_I5Y5HlqmXHbgdpGe-lpKtt5dpitbKMPgtJMTl1lX4GbNqzLZGxHuTZ2U0_9anWtPr_KWZJLvdLy9-0cgo0Nsu2ajUfIa_SJAeZwI3h8U_Um-wupI73M-1ac1CKJtDmVfW56LaDOXHbzIeLWsFstG7_1lnihzomumDL5VHdJbyA1D3E7VlyIfuC6hPsqzGERM6KVU-_Ku1ub0TtvtixsZLsZ3Fl-qWs6vB4nOy5pj5RkRezaBXlkSl7lG3IgGCv4nSN8YdaJx4SHId4o0iAy5jKXyEJeYXD_hFPKx6RQMsSBkSKMklJsKSZwi9zC5q_8Q5SUP5TiHwPgrhK_Evz-65eNYYEa_KbBOPJeDh3vak7n3r-xPcmA7IiwZ07nI08fz6-80b-dDZ1NwPypw46Gs58zx_53shz_cl0Np9v_gKdh2ia)

2. Initalized a npm package then put it in a git repo.

3. Generated .gitignore using an online gitignore genrator.

4. Made a folder structure using this [video](https://www.youtube.com/watch?v=9B4CvtzXRpc&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=7).

5. Connected to database using mongoDB atlas. Pushed the code to GitHub as well.

6. wrote some utilities that i will use throughout the code like apiError, ApiResponse and AsyncHandler.

7. went on to write the first models, i.e. user and repo model. I have deviated a bit from the original model diagram, although i have not removed any fields from the model I have added some like default branch, size and stats of the repo in repo model. Also added avatar field to user model.

8. Installed the bcrypt package and used it to firstly hash the password before saving it in backend and secondly made a function to check whether password in backend is same as password entered by the user later. so far so good !

9. Made a utility to upload files to cloudinary using cloudinary.uploader.upload, also i am saving the files locally on server in case the file upload fails and is re attempted. Configured multer middleware as well, used diskStorage for uploading file on server.

10. I am currently at connecting frontend and backend using axios and getting a lil confused so i decided to write what i have learned so far. I am also using postman to check my contoller's working. So i am sending the data via post method in both postman and using axios then my server is recieving the data using req.body in the form of an object which i am destructuring and i am able to access that data which i will upload in the backend. Then I made sure that the image (avatar) that i am recieving is uploaded to my server using multer middleware by inserting the middleware in user route file. That way i have secured the image on my server, which i will eventually upload to cloudinary.
