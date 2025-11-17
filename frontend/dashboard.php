<div>
  <form id="groupForm">
    <input type="text" name="group_name" placeholder="Enter group name" required>
    <button type="submit">Create Group</button>
  </form>
</div>

<div id="dashboard">
  <!-- Groups will appear here -->
</div>

<script>
const dashboard = document.getElementById("dashboard");
const form = document.getElementById("groupForm");

// Fetch and display all groups
function loadGroups() {
  fetch('get_groups.php')
    .then(res => res.json())
    .then(data => {
      dashboard.innerHTML = '';
      data.forEach(group => {
        dashboard.innerHTML += `<div>${group.name}</div>`;
      });
    });
}

// On page load
loadGroups();

// Handle group creation
form.addEventListener('submit', e => {
  e.preventDefault();
  const formData = new FormData(form);

  fetch('create_group.php', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if(data.status === "success"){
      // Append new group to dashboard immediately
      const group = data.group;
      dashboard.innerHTML += `<div>${group.name}</div>`;
      form.reset();
    } else {
      alert(data.message);
    }
  });
});
</script>
