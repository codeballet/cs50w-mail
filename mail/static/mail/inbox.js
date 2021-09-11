document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email(false));

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(id) {
  console.log(`id: ${id}`)
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // if id argument given, fetch that email
  if (id) {
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      console.log(email);

      // fill composition fields with values
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}`;
    })
    .catch(error => {
      console.log('Error:', error);
    })
  }

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
    })
    .catch(error => {
      console.log('Error:', error);
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
      // Create HTML elements
      const div = document.createElement('div');
      div.className = 'flex-container';

      // colour the div grey if email is read
      if (email.read && mailbox === 'inbox') {
        div.style.backgroundColor = '#bbbbbb';
      }

      // give unique id to each email div element
      div.id = `email-${id}`

      // create sub elements for each email div
      const sender = document.createElement('div');
      sender.className = 'sender';
      sender.innerHTML = email.sender;

      const subject = document.createElement('div');
      subject.className = 'subject';
      subject.innerHTML = email.subject;

      const timestamp = document.createElement('div');
      timestamp.className = 'timestamp';
      timestamp.innerHTML = email.timestamp;

      // clear any existing div elements
      if (document.querySelector(`#email-${id}`)) {
        document.querySelectorAll(`#email-${id}`).forEach(element => {
          element.remove();
        })
      }

      // Append elements to DOM
      document.querySelector('#emails-view').append(div);
      document.querySelector(`#email-${id}`).append(sender);
      document.querySelector(`#email-${id}`).append(subject);
      document.querySelector(`#email-${id}`).append(timestamp);      

      // Add event listener to email div
      document.querySelector(`#email-${id}`).onclick = (e) => {
        const email_id = e.target.parentElement.id;
        const id = parseInt(email_id.split('-')[1]);
        load_email(id, mailbox);
      }
    })
  })
  .catch(error => {
    console.log('Error:', error);
  });
}

function load_email(id, mailbox) {
  // Show load_email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  // fetch the email
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email)

    if (mailbox === 'sent') {
      // do not show the Archive button
      document.querySelector('#archive').style.display = 'none';
    } else {
      // set the Archive button text
      document.querySelector('#archive').style.display = 'inline';
      document.querySelector('#archive').innerHTML = email.archived ? 'Unarchive' : 'Archive';
    }

    // create HTML elements
    const sender_span = document.createElement('span');
    sender_span.className = 'email-info';
    sender_span.innerHTML = email.sender;

    const recipients_span = document.createElement('span');
    recipients_span.className = 'email-info';
    recipients_span.innerHTML = email.recipients.join('; ');

    const subject_span = document.createElement('span');
    subject_span.className = 'email-info';
    subject_span.innerHTML = email.subject;

    const timestamp_span = document.createElement('span');
    timestamp_span.className = 'email-info';
    timestamp_span.innerHTML = email.timestamp;

    const body = document.createElement('p');
    body.className = 'email-info';
    body.innerHTML = email.body;

    // clear any existing content in email-info class
    if (document.querySelector('.email-info')) {
      document.querySelectorAll('.email-info').forEach(element => {
        element.remove();
      })
    }

    // append elements to DOM
    document.querySelector('#email-from').append(sender_span);
    document.querySelector('#email-to').append(recipients_span);
    document.querySelector('#email-subject').append(subject_span);
    document.querySelector('#email-timestamp').append(timestamp_span);
    document.querySelector('#email-body').append(body);

    // update email read status to true
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })
    .catch(error => {
      console.log('Error:', error);
    })

    // eventlistener for reply button
    document.querySelector('#reply').addEventListener('click', () => {
      compose_email(id);
    })

    // eventlistener for archive button
    document.querySelector('#archive').addEventListener('click', () => {
      if (!email.archived) {
        // call archive function
        archive(id);
      } else {
        // call unarchive function
        unarchive(id);
      }
    })
  })
  .catch(error => {
    console.log('Error:', error);
  })
}

// archive emails
function archive(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  .then((result) => {
    console.log(result);
    window.location.reload();
  })
  .catch(error => {
    console.log('Error:', error);
  })
}

// unarchive emails
function unarchive(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
  .then((result) => {
    console.log(result);
    window.location.reload();
  })
  .catch(error => {
    console.log('Error:', error);
  })
}