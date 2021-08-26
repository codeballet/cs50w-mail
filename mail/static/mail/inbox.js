document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Submit form
  document.querySelector('#compose-form').addEventListener('submit', (e) => {
    e.preventDefault();
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);
      if (result['error']) {
        window.alert(result['error']);
      }
      // Load the user's sent mailbox
      load_mailbox('sent');
    });
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // get emails from mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails)

    // Loop over the emails object
    emails.forEach(email => {
      // get the email id
      id = email.id;
      // Create the HTML elements
      const div = document.createElement('div');
      div.className = 'flex-container';

      // Make the id of each email div unique
      div.id = `email_${id}`

      const sender = document.createElement('div');
      sender.className = 'sender';
      sender.innerHTML = email.sender;

      const subject = document.createElement('div');
      subject.className = 'subject';
      subject.innerHTML = email.subject;

      const timestamp = document.createElement('div');
      timestamp.className = 'timestamp';
      timestamp.innerHTML = email.timestamp;

      // Append all the elements to the DOM
      document.querySelector('#emails-view').append(div);
      document.querySelector(`#email_${id}`).append(sender);
      document.querySelector(`#email_${id}`).append(subject);
      document.querySelector(`#email_${id}`).append(timestamp)

      // Add event listener to email div
      document.querySelector(`#email_${id}`).onclick = (e) => {
        const email_id = e.target.parentElement.id;
        const id = parseInt(email_id.split('_')[1]);
        load_email(id);
      }
    })
  });
}

function load_email(id) {
  // Show load_email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  document.querySelector('#email-view').innerHTML = `Load email with id "${id}" here.`;
}