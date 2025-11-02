document.getElementById("careerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const skills = document.getElementById("skills").value;
  const interests = document.getElementById("interests").value;
  const resultBox = document.getElementById("result");

  resultBox.innerText = "⚙️ Analyzing your skills with Gemini AI...";
  
  const response = await fetch("/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, skills, interests })
  });

  const data = await response.json();
  document.getElementById("result").innerHTML = data.message || "⚠️ Unable to get recommendation. Try again.";  
});
