exports.handler = async (event, context) => {
  const questions = [
    {
      id: 1,
      text: "What is Responsible AI?",
      options: [
        "AI that is always accurate",
        "AI that adheres to ethical guidelines and principles",
        "AI that is developed by large companies",
        "AI that is open-source"
      ],
      correctAnswer: 1,
      domain: "Responsible AI"
    },
    {
      id: 2,
      text: "Which of the following is a key principle of Responsible AI?",
      options: [
        "Profit maximization",
        "Transparency",
        "Speed of development",
        "Proprietary algorithms"
      ],
      correctAnswer: 1,
      domain: "Responsible AI"
    },
    {
      id: 11,
      text: "What is GitHub Copilot?",
      options: [
        "A project management tool",
        "An AI-powered code completion tool",
        "A version control system",
        "A bug tracking system"
      ],
      correctAnswer: 1,
      domain: "GitHub Copilot Plans and Features"
    }
  ];

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(questions)
  };
};
