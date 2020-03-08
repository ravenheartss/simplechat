// SENG 513 Assignment 3 -- Winter 2020
// Name: Shankar Ganesh
// UCID: 30055527
// Tutorial/Lab: T01/B01

$(function() {
   var socket = io();

   let user_id;
   // Get the user_id from cookie if there is one.
   user_id = getCookie("user_id");
   // Store all the ID's the user has used. 
   let my_ids = [];

   // If no cookie then initialize. 
   // Server sends a userid.
   if (user_id === ""){
      socket.emit('init');
   }else{
      // If found then setup connection and push the id to my_ids.
      socket.emit('setup', user_id);
      my_ids.push(user_id);
   }
   
   // Server sends userid if no cookie. 
   socket.on('init', function(uid){
      user_id = uid;
      setCookie("user_id", uid);
      my_ids.push(user_id);
   });

   // cookie_uid = getCookie("user_id");
   let ucolour = getCookie("colour");

   // Server sends message history as a list 
   // Add all messages to the chat. 
   socket.on('messages', function(msg_history){
      for (let i = 0; i < msg_history.length; i++){
         [msg, time, uid, colour] = msg_history[i];
         
         if (my_ids.includes(uid)){
            to_show = '<div class="outg messages"><span style="color: ' + colour + ';">' + uid + '</span>';
            to_show = to_show + '<div class="msg last"><b>' + msg + '</b></div>';
         }else{
            to_show = '<div class="incoming messages"><span style="color: ' + colour + ';">' + uid + ':</span>';
            to_show = to_show + '<div class="msg last">' + msg + '</div>';
         }
         to_show = to_show + '<span style="font-size: small; color: darkgrey">' + time + '</span></div>';

         $('.content').prepend(to_show);
      }
   });

   // If client presses send then prevent automatic page reloading
   // Send message to server. 
   $('form').on('submit', function(e){
      e.preventDefault();
      socket.emit('chat', $('.input_msg').val(), getCookie('user_id'), getCookie('colour'));
      $('.input_msg').val("");
      return false;
   });


   // Add a message to the chat. 
   // Server sends the message.
   socket.on('chat', function(msg, time, uid, colour){
      let to_show = "";
      if (my_ids.includes(uid)){
         to_show = '<div class="outg messages"><span style="color: ' + colour + ';">' + uid + '</span>';
         to_show = to_show + '<div class="msg last"><b>' + msg + '</b></div>';
      }else{
         to_show = '<div class="incoming messages"><span style="color: ' + colour + ';">' + uid + ':</span>';
         to_show = to_show + '<div class="msg last">' + msg + '</div>';
      }
      to_show = to_show + '<span style="font-size: small; color: darkgrey">' + time + '</span></div>';

      $('.content').prepend(to_show);
   });

   // If client entered a colour change command then server calls this with the colour
   // Changes the colour stored in the cookie
   socket.on('colour_change', function(colour){
      setCookie('colour', colour);
   });

   // If client entered a name change command then server calls this with the name
   // Changes the nickname stored in the cookie 
   socket.on('change_uid', function(uid){
      user_id = uid;
      setCookie('user_id', uid);
      my_ids.push(user_id);
   });

   // Server sends the list of connected users.
   // Add this to the respective div. 
   socket.on('conn_users', function(user_list){
      let to_add = "";
      for (let i = 0; i < user_list.length; i++){
         to_add = to_add + '<div class="usr"><img src="User_icon_2.svg"/>';
         to_add = to_add + user_list[i] + '</div>';
      }
      $('.online_users').html(to_add);
   });
});


// These functions have been taken from w3schools.

// Set a cookie to a value.
function setCookie(cookieName, cookieValue) {
   document.cookie = cookieName + " = " + cookieValue  + ";";
}

// Get cookie from browser.
function getCookie(cookieName) {
   let name = cookieName + "=";
   let ca = document.cookie.split(';');
   for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
         c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
         return c.substring(name.length, c.length);
      }
   }
   return "";
}

