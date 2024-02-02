const express = require('express')
const router = express.Router();
const User = require('../models/user');
const multer =require('multer')
const fs= require('fs')
var storage = multer.diskStorage({
   destination:function(req,file,cb){
      cb(null,'./uploads')
   },
   filename:function(req,file,cb){
      cb(null,file.fieldname+"_"+Date.now()+"_"+file.originalname);
   }
})
var upload = multer({
   storage:storage,
}).single('image')

router.get("/", (req, res) => {
   User.find().exec()
      .then(users => {
         res.render('home', { title: 'home page', users: users }); 
      })
      .catch(error => {
         res.json({ message: error.message });
      });
});
router.get("/add",(req,res)=>{
   res.render('add_users',{title: 'Add users'}) 
})



router.post("/add",upload,(req,res)=>{
   const user = new User({
      name:req.body.name,
      email:req.body.email,

      phone:req.body.phone,
      image:req.file.filename
      
   });
   user.save()
   .then(result => {
   req.session.message ={
      type:'sucess',
      message:"user added sucessfully "
   }
   res.redirect('/')
     // Handle success
   })
   .catch(error => {
     res.json({message:error.message,type:'danger'});
     // Handle error
   });

   })
   router.get('/edit/:id', (req, res) => {
      let id = req.params.id;
      User.findById(id)
          .then(user => {
              if (!user) {
                  res.redirect('/');
              } else {
                  res.render('./edit', {
                      title: "edit user",
                      user: user
                  });
              }
          })
          .catch(err => {
              console.error(err);
              res.redirect('/');
          });
  });
 
   
  router.post('/update/:id',upload, (req, res) => {
   let id = req.params.id;
   let new_image = '';

   if (req.file) {
      new_image = req.file.filename;
      // Delete the old image if a new image is uploaded
      try {
         fs.unlinkSync('./uploads/' + req.body.old_image);
      } catch (err) {
         console.log(err);
      }
   } else {
      new_image = req.body.old_image;
   }

   User.findByIdAndUpdate(id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: new_image
   })
   .then(() => {
      req.session.message = {
         type: 'success',
         message: 'updated'
      };
      res.redirect("/");
   })
   .catch(err => {
      // Handle errors during update
      res.json({ message: err.message, type: 'danger' });
   });
});
router.get('/delete/:id', (req, res) => {
   let id = req.params.id;

   User.findByIdAndDelete(id)
       .then(deletedUser => {
           if (!deletedUser) {
               // If user not found, redirect to the home page or show an error
               req.session.message = {
                   type: 'danger',
                   message: 'User not found or already deleted'
               };
           } else {
               // If user is deleted successfully, set success message
               req.session.message = {
                   type: 'success',
                   message: 'User deleted successfully'
               };
           }
           res.redirect("/");
       })
       .catch(err => {
           // Handle errors
           console.error(err);
           req.session.message = {
               type: 'danger',
               message: 'Failed to delete user'
           };
           res.redirect("/");
       });
});



  
module.exports = router;