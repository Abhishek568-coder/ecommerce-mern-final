function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <h2>Please login</h2>;

  return (
    <div style={{ padding: "40px" }}>
      <h2>User Profile</h2>
      <p><b>Name:</b> {user.name}</p>
      <p><b>Age:</b> {user.age}</p>
      <p><b>Email:</b> {user.email}</p>
    </div>
  );
}

export default Profile;