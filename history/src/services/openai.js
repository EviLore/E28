/**
 * Service for generating history quiz questions using OpenAI's API
 * This file handles all the API communication and question generation logic
 */

/**
 * Generates a history question with the specified difficulty level
 * @param {string} difficulty - Difficulty level (easy, medium, hard, extreme)
 * @returns {Promise<Object>} - Question object with question, options, answer, and explanation
 */
export const getHistoryQuestion = async (difficulty = "medium") => {
    // Define historical time periods as categories for questions
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
    
    // Define geographical regions for question context
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
    
    // Select random category and region to create varied questions
    const category = categories[Math.floor(Math.random() * categories.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    
    // Define descriptions for each difficulty level to guide AI question generation
    const difficultyDescriptions = {
      easy: "suitable for middle school students (grades 6-8). Focus on well-known historical figures, major events, and basic historical concepts.",
      medium: "suitable for high school students. Include moderately challenging questions about significant historical events, movements, and figures that would be covered in a high school curriculum.",
      hard: "college-level difficulty. Questions should require deeper historical knowledge, including specific dates, lesser-known historical figures, and more complex historical processes.",
      extreme: "PhD-level difficulty. Questions should be extremely challenging, focused on historiography, obscure historical events, specialized historical knowledge, and nuanced historical interpretations that even history enthusiasts might struggle with."
    };

    // Define temperature settings for each difficulty (controls AI randomness)
    const temperature = {
      easy: 0.7,    // More predictable responses
      medium: 0.8,  // Moderate creativity
      hard: 0.9,    // More creative responses
      extreme: 1.0  // Maximum creativity
    };
    
    // Define number of multiple choice options for each difficulty level
    const numOptions = {
      easy: 3,      // 3 options (A, B, C)
      medium: 4,    // 4 options (A, B, C, D)
      hard: 5,      // 5 options (A, B, C, D, E)
      extreme: 6    // 6 options (A, B, C, D, E, F)
    };
    
    // Normalize difficulty level and get the number of options
    const difficultyLevel = difficulty.toLowerCase();
    const totalOptions = numOptions[difficultyLevel];
    
    // Create option letters object (A, B, C, etc.) based on difficulty
    const optionLetters = {};
    for (let i = 0; i < totalOptions; i++) {
      const letter = String.fromCharCode(65 + i); // ASCII: 65 = 'A', 66 = 'B', etc.
      optionLetters[letter] = `Option ${letter}`;
    }
    
    // Create template for options in the API prompt
    const optionsTemplate = Object.keys(optionLetters)
      .map(letter => `"${letter}": "Option text ${letter}"`)
      .join(",\n      ");
    
    // Make API request to OpenAI to generate the question
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`, // API key from environment variables
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o", // Using GPT-4o model for high-quality responses
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
        temperature: temperature[difficultyLevel], // Adjust creativity based on difficulty
        response_format: { type: "json_object" } // Request structured JSON response
      }),
    });
  
    // Parse the API response
    const result = await response.json();
    try {
      // Extract and parse the content from the API response
      const content = result.choices[0].message.content;
      const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
      
      // Validate that the response contains all required fields
      if (!parsedContent.question || !parsedContent.options || !parsedContent.answer) {
        throw new Error("Invalid response format from OpenAI");
      }
      
      // Validate that the response has the correct number of options for the difficulty
      const responseOptions = Object.keys(parsedContent.options);
      if (responseOptions.length !== totalOptions) {
        throw new Error(`Expected ${totalOptions} options but got ${responseOptions.length}`);
      }
      
      // Add metadata to the question for display and categorization
      parsedContent.category = category;
      parsedContent.region = region;
      parsedContent.difficulty = difficulty;
      
      return parsedContent;
    } catch (error) {
      // Log the error and provide a fallback question if the API fails
      console.error("Error parsing OpenAI response:", error);
      
      // Define fallback choices for US Presidents as a reliable fallback
      const fallbackOptions = {};
      const fallbackChoices = [
        "George Washington",
        "John Adams",
        "Thomas Jefferson",
        "James Madison",
        "James Monroe",
        "John Quincy Adams"
      ];
      
      // Generate the appropriate number of options based on selected difficulty
      for (let i = 0; i < totalOptions; i++) {
        const letter = String.fromCharCode(65 + i);
        fallbackOptions[letter] = fallbackChoices[i];
      }
      
      // Return a simple US history question as fallback
      return {
        question: "Who was the first President of the United States?",
        options: fallbackOptions,
        answer: "A", // George Washington
        explanation: "George Washington was the first President of the United States, serving from 1789 to 1797.",
        category: "Modern History (1800-1945)",
        region: "North American",
        difficulty: difficulty
      };
    }
  };