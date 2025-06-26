exports.handler = async function(event, context) {
  const content = `### Domain 1: Responsible AI (7%)
1. **What is Responsible AI?**  
   a) AI that is always accurate  
   b) AI that adheres to ethical guidelines and principles  
   c) AI that is developed by large companies  
   d) AI that is open-source  
   **Answer: b**
2. **Which of the following is a key principle of Responsible AI?**  
   a) Profit maximization  
   b) Transparency  
   c) Speed of development  
   d) Proprietary algorithms  
   **Answer: b**
3. **Why is fairness important in AI?**  
   a) To ensure AI systems are profitable  
   b) To prevent bias and discrimination  
   c) To increase the speed of AI development  
   d) To reduce the cost of AI systems  
   **Answer: b**
4. **What does AI transparency involve?**  
   a) Making AI systems open-source  
   b) Explaining how AI decisions are made  
   c) Ensuring AI systems are fast  
   d) Keeping AI algorithms secret  
   **Answer: b**
5. **Which organization provides guidelines for Responsible AI?**  
   a) World Health Organization  
   b) OpenAI  
   c) IEEE  
   d) NASA  
   **Answer: c**

### Domain 2: GitHub Copilot Plans and Features (31%)
11. **What is GitHub Copilot?**  
    a) A project management tool  
    b) An AI-powered code completion tool  
    c) A version control system  
    d) A bug tracking system  
    **Answer: b**
12. **Which AI model powers GitHub Copilot?**  
    a) GPT-3  
    b) BERT  
    c) T5  
    d) GPT-4  
    **Answer: a**
13. **What programming languages does GitHub Copilot support?**  
    a) Only Python  
    b) Only JavaScript  
    c) Multiple programming languages  
    d) Only Java  
    **Answer: c**

### Domain 3: How GitHub Copilot Works and Handles Data (15%)
21. **How does GitHub Copilot generate code suggestions?**  
    a) By using a rule-based system  
    b) By using a large language model trained on public code  
    c) By analyzing the entire internet  
    d) By using a fixed set of code snippets  
    **Answer: b**
22. **What type of data does GitHub Copilot use for training?**  
    a) Proprietary code  
    b) Publicly available code  
    c) Only Python code  
    d) Only JavaScript code  
    **Answer: b**

### Domain 4: Prompt Crafting and Prompt Engineering (9%)
31. **What is prompt engineering?**  
    a) The process of writing code  
    b) The process of designing and refining prompts for AI models  
    c) The process of managing repositories  
    d) The process of testing code  
    **Answer: b**
32. **Why is prompt crafting important for GitHub Copilot?**  
    a) To ensure code is written faster  
    b) To improve the accuracy and relevance of code suggestions  
    c) To reduce the cost of AI systems  
    d) To make projects open-source  
    **Answer: b**

### Domain 5: Developer Use Cases for AI (14%)
41. **What is a common use case for AI in software development?**  
    a) Managing repositories  
    b) Code completion and suggestions  
    c) Tracking issues  
    d) Handling pull requests  
    **Answer: b**
42. **How can AI help with code reviews?**  
    a) By replacing human reviewers  
    b) By providing automated code analysis and suggestions  
    c) By managing repositories  
    d) By tracking issues  
    **Answer: b**

### Domain 6: Testing with GitHub Copilot (9%)
51. **How can GitHub Copilot assist with writing test cases?**  
    a) By managing repositories  
    b) By generating test cases based on code context  
    c) By tracking issues  
    d) By handling pull requests  
    **Answer: b**
52. **What is the benefit of using GitHub Copilot for testing?**  
    a) To reduce the cost of development  
    b) To generate test cases faster and more accurately  
    c) To make projects open-source  
    d) To manage repositories  
    **Answer: b**

### Domain 7: Privacy Fundamentals and Context Exclusions (15%)
61. **What is the importance of privacy in AI?**  
    a) To increase the speed of AI development  
    b) To protect user data and ensure ethical use of AI  
    c) To reduce the cost of AI systems  
    d) To make AI systems open-source  
    **Answer: b**
62. **How does GitHub Copilot handle user data?**  
    a) By storing all data locally  
    b) By anonymizing and aggregating data  
    c) By not storing any user data  
    d) By using encryption  
    **Answer: b**`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    },
    body: content
  };
};
