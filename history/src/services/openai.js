export const getHistoryQuestion = async (difficulty = "medium") => {
    // Create array of history categories and pick a random one
    const categories = [
      "Ancient History (before 500 CE)",
      "Medieval History (500-1500 CE)",
      "Early Modern History (1500-1800)",
      "Modern History (1800-1945)",
      "Contemporary History (post-1945)",
      "Military History",
      "Political History",
      "Cultural History",
      "Scientific History",
      "Economic History"
    ];
    
    const regions = [
      "World",
      "European",
      "Asian",
      "African",
      "North American",
      "South American",
      "Middle Eastern",
      "Oceanian"
    ];
    
    // Select random category and region
    const category = categories[Math.floor(Math.random() * categories.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    
    // Define difficulty parameters
    const difficultyDescriptions = {
      easy: "suitable for middle school students (grades 6-8). Focus on well-known historical figures, major events, and basic historical concepts.",
      medium: "suitable for high school students. Include moderately challenging questions about significant historical events, movements, and figures that would be covered in a high school curriculum.",
      hard: "college-level difficulty. Questions should require deeper historical knowledge, including specific dates, lesser-known historical figures, and more complex historical processes.",
      extreme: "PhD-level difficulty. Questions should be extremely challenging, focused on historiography, obscure historical events, specialized historical knowledge, and nuanced historical interpretations that even history enthusiasts might struggle with."
    };

    const temperature = {
      easy: 0.7,
      medium: 0.8,
      hard: 0.9,
      extreme: 1.0
    };
    
    // Determine number of options based on difficulty
    const numOptions = {
      easy: 3,
      medium: 4,
      hard: 5,
      extreme: 6
    };
    
    // Generate option letters (A, B, C, etc.) based on difficulty
    const difficultyLevel = difficulty.toLowerCase();
    const totalOptions = numOptions[difficultyLevel];
    
    // Create option letters object
    const optionLetters = {};
    for (let i = 0; i < totalOptions; i++) {
      const letter = String.fromCharCode(65 + i); // A, B, C, etc.
      optionLetters[letter] = `Option ${letter}`;
    }
    
    // Create option template string for prompt
    const optionsTemplate = Object.keys(optionLetters)
      .map(letter => `"${letter}": "Option text ${letter}"`)
      .join(",\n      ");
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content:
              `Generate a ${difficultyLevel} difficulty history trivia question about ${category} with a focus on ${region} history, if applicable. 
              
              The question should be ${difficultyDescriptions[difficultyLevel]} and have exactly ${totalOptions} multiple choice options.
              
              The response must be a valid JSON object with exactly this format:
              {
                "question": "The question text",
                "options": {
                  ${optionsTemplate}
                },
                "answer": "The correct letter (must be one of: ${Object.keys(optionLetters).join(', ')})",
                "explanation": "A brief explanation of why this answer is correct"
              }`,
          },
        ],
        temperature: temperature[difficultyLevel],
        response_format: { type: "json_object" }
      }),
    });
  
    const result = await response.json();
    try {
      // Use the native JSON response if OpenAI returns it directly
      const content = result.choices[0].message.content;
      const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
      
      // Ensure the response has the expected format
      if (!parsedContent.question || !parsedContent.options || !parsedContent.answer) {
        throw new Error("Invalid response format from OpenAI");
      }
      
      // Validate the number of options
      const responseOptions = Object.keys(parsedContent.options);
      if (responseOptions.length !== totalOptions) {
        throw new Error(`Expected ${totalOptions} options but got ${responseOptions.length}`);
      }
      
      // Store the category, region, and difficulty for future reference
      parsedContent.category = category;
      parsedContent.region = region;
      parsedContent.difficulty = difficulty;
      
      return parsedContent;
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      // Return a fallback question with appropriate number of options
      const fallbackOptions = {};
      const fallbackChoices = [
        "George Washington",
        "John Adams",
        "Thomas Jefferson",
        "James Madison",
        "James Monroe",
        "John Quincy Adams"
      ];
      
      // Generate the correct number of options based on difficulty
      for (let i = 0; i < totalOptions; i++) {
        const letter = String.fromCharCode(65 + i);
        fallbackOptions[letter] = fallbackChoices[i];
      }
      
      return {
        question: "Who was the first President of the United States?",
        options: fallbackOptions,
        answer: "A",
        explanation: "George Washington was the first President of the United States, serving from 1789 to 1797.",
        category: "Modern History (1800-1945)",
        region: "North American",
        difficulty: difficulty
      };
    }
  };