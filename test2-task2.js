const mainFunction = (input) => {
  // Validate that input is an object with two keys, "original" and "change";
  if (typeof input !== "object") {
    throw new Error("Input must be an object");
  }

  if (!input.hasOwnProperty("original") || !input.hasOwnProperty("change")) {
    throw new Error("Input must have two keys, 'original' and 'change'");
  }

  // Define original and change variables
  const { original, change } = input;

  // Validate that "original" has the correct keys and their values are date strings
  const originalKeys = ["m1", "m2", "m3", "m4", "m5", "project deadline"];

  // Make sure that all the keys required are provided in the original object
  originalKeys.forEach((key) => {
    if (!Object.keys(original).includes(key)) {
      throw new Error(
        `The key "${key}" is missing from the "original" object.`
      );
    }
  });

  // Make sure that all the keys provided in the original object are valid
  if (
    !Object.keys(input.original).every(
      (key) =>
        originalKeys.includes(key) && !isNaN(Date.parse(input.original[key]))
    )
  ) {
    throw new Error(
      "'original' must have keys 'm1', 'm2', 'm3', 'm4', 'm5', 'project deadline' with date string values"
    );
  }

  // Validate that "change" has one key that is one of "m1", "m2", "m3", "m4", "m5" and its value is a date string
  const changeKey = Object.keys(input.change)[0];
  if (
    !originalKeys.includes(changeKey) ||
    isNaN(Date.parse(input.change[changeKey]))
  ) {
    throw new Error(
      "'change' must have one key that is one of 'm1', 'm2', 'm3', 'm4', 'm5' with a date string value"
    );
  }

  // Create a copy of the original object
  const copyOriginal = JSON.parse(JSON.stringify(original));

  // Define milestone keys
  const milestones = Object.keys(original).filter(
    (key) => key !== "project deadline"
  );

  // Define changedOne and changedDate variables
  const changedOne = Object.keys(change)[0];
  const changedDate = new Date(change[changedOne]);

  // Validate changeDate to not be the same as the project deadline or  a weekend or earlier than previous milestone

  // Define project deadline variable
  const projectDeadline = new Date(original["project deadline"]);
  // If the changed date is the same as the project deadline
  if (changedDate.getTime() === projectDeadline.getTime()) {
    throw new Error("Change date cannot be the same as the project deadline.");
  }

  // If the changed date is a weekend
  if (changedDate.getDay() === 0 || changedDate.getDay() === 6) {
    throw new Error("Change date cannot be a weekend");
  }

  // // Find the index of the changed milestone
  const changedMilstoneIndex = milestones.indexOf(changedOne);
  // If the changed milestone is not the first one
  if (changedMilstoneIndex > 0) {
    // Get the date of   the previous milestone
    const previousMilestone = milestones[changedMilstoneIndex - 1];

    // If the changed date is earlier than the previous milestone date
    if (changedDate < new Date(original[previousMilestone])) {
      throw new Error("Change date cannot be earlier than previous milestone");
    }
  }

  // Function that ensures the adjusted date is not a weekend or the same as the original date
  const adjustDate = (date, daysToAdd) => {
    const adjustedDate = new Date(date.getTime() + daysToAdd);
    while (
      adjustedDate.getDay() === 0 ||
      adjustedDate.getDay() === 6 ||
      adjustedDate.toDateString() === date.toDateString()
    ) {
      adjustedDate.setDate(adjustedDate.getDate() + 1);
    }
    return adjustedDate.toISOString().split("T")[0];
  };

  // Function that calculates the days to add on each milestone and ensure adjusted dates are not the same as the project deadline
  const adjustMilestoneDate = (
    milestone,
    index,
    changedDate,
    adjustedDeadline,
    original
  ) => {
    const daysToAdd =
      Math.round(
        (adjustedDeadline.getTime() - changedDate.getTime()) /
          (eligibleMilestones.length + 1)
      ) *
      (index + 1);

    // Save the adjusted date in a variable
    let newDate = adjustDate(changedDate, daysToAdd);

    // Ensure adjusted date is not the same as the project deadline by incrementing deadline day by 1 if they are equal
    if (newDate === original["project deadline"]) {
      adjustedDeadline.setDate(adjustedDeadline.getDate() + 1);
      original["project deadline"] = adjustedDeadline
        .toISOString()
        .split("T")[0];
    }

    original[milestone] = newDate;
  };

  // Determine which milestones need to be adjusted
  const eligibleMilestones = milestones.slice(changedMilstoneIndex + 1);

  // Adjust the project deadline if necessary
  let adjustedDeadline = new Date(original["project deadline"]);

  // Adjust the eligible milestones dates
  eligibleMilestones.forEach((milestone, index) => {
    adjustMilestoneDate(
      milestone,
      index,
      changedDate,
      adjustedDeadline,
      original
    );
  });

  // Variable to check if adjustment of eligible milestones is identical to the original
  let isIdentical = eligibleMilestones.every(
    (milestone) =>
      new Date(original[milestone]).getTime() ===
      new Date(copyOriginal[milestone]).getTime()
  );

  // While the adjustment of eligible milestones is identical to the original...
  while (isIdentical) {
    // The project deadline += 1
    adjustedDeadline.setDate(adjustedDeadline.getDate() + 1);
    // Modify the string to exclude the time
    original["project deadline"] = adjustedDeadline.toISOString().split("T")[0];

    // Recalculate the eligible milestones until the resulting adjustment change
    eligibleMilestones.forEach((milestone, index) => {
      adjustMilestoneDate(
        milestone,
        index,
        changedDate,
        adjustedDeadline,
        original
      );
    });

    // Update the isIdentical variable

    isIdentical = eligibleMilestones.every(
      (milestone) =>
        new Date(original[milestone]).getTime() ===
        new Date(copyOriginal[milestone]).getTime()
    );

    // if updated isIdentical is false, break out of the loop
    if (!isIdentical) return original;
  }

  // Updated changed milestone (changedOne) with changedDate
  original[changedOne] = changedDate.toISOString().split("T")[0];

  // Return the updated object
  return original;
};

const testSchemas = [
  {
    original: {
      m1: "2023-10-02",
      m2: "2023-10-06",
      m3: "2023-10-12",
      m4: "2023-10-18",
      m5: "2023-10-24",
      "project deadline": "2023-10-25",
    },
    change: { m1: "2023-10-09" },
  },
  {
    original: {
      m1: "2023-10-02",
      m2: "2023-10-06",
      m3: "2023-10-12",
      m4: "2023-10-18",
      m5: "2023-10-24",
      "project deadline": "2023-10-30",
    },
    change: { m2: "2023-10-09" },
  },
  {
    original: {
      m1: "2023-10-02",
      m2: "2023-10-06",
      m3: "2023-10-12",
      m4: "2023-10-18",
      m5: "2023-10-24",
      "project deadline": "2023-10-30",
    },
    change: { m3: "2023-10-16" },
  },
  {
    original: {
      m1: "2023-10-02",
      m2: "2023-10-06",
      m3: "2023-10-12",
      m4: "2023-10-18",
      m5: "2023-10-24",
      "project deadline": "2023-10-30",
    },
    change: { m4: "2023-10-20" },
  },
  {
    original: {
      m1: "2023-10-02",
      m2: "2023-10-06",
      m3: "2023-10-12",
      m4: "2023-10-18",
      m5: "2023-10-24",
      "project deadline": "2023-10-30",
    },
    change: { m2: "2023-10-06" },
  },

  // Objects that will through error due to validation
  {
    original: {
      m1: "2023-10-02",
      m2: "2023-10-06",
      m3: "2023-10-12",
      m4: "2023-10-18",
      m5: "2023-10-24",
      m6: "2023-10-24",
      "project deadline": "2023-10-30",
    },
    change: { m2: "2023-10-06" },
  },
  // {
  //   "change": { "m1": "2023-10-09" }
  // },
  // {
  //   original: { m1: "2023-10-02", "project deadline": "2023-10-30" },
  //   change: { m1: "2023/10/09" },
  // },
];

// Test the function with each schema
testSchemas.forEach((schema, index) => {
  console.log(`Test ${index + 1}:`, mainFunction(schema));
});
