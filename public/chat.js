// Set up EventSource to listen for messages from the server
new window.EventSource("/sse").onmessage = function(event) {
    window.messages.innerHTML += `<p>${event.data}</p>`;
  };
  
  // Handle form submission to send a message to the server
  window.form.addEventListener('submit', function(event) {
    event.preventDefault();
    window.fetch(`/chat?message=${window.input.value}`);
    window.input.value = '';
  });
  