export const validateProfileInputs = (profile) => {
    let errors = {};
    const namePattern = /^[A-Za-z\s]+$/; // Only letters and spaces allowed
    if (!namePattern.test(profile.firstName)) {
        errors.firstName = "First name cannot contain numbers or special characters.";
    }
    if (!namePattern.test(profile.lastName)) {
        errors.lastName = "Last name cannot contain numbers or special characters.";
    }
    //  Registration Number Validation (Format: XXZZZXXXX)
    const regNoPattern = /^[0-9]{2}[A-Za-z]{3}[0-9]{4}$/;
    if (!regNoPattern.test(profile.regNo)) {
        errors.regNo = "Invalid Registration Number (Format: XXZZZXXXX).";
    }

    //  Phone Number Validation (10 digits)
    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(profile.phone)) {
        errors.phone = "Phone number must be exactly 10 digits.";
    }

    //  GitHub Link Validation
    const githubPattern = /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9-]+\/?$/;
    if (profile.github && !githubPattern.test(profile.github)) {
        errors.github = "Invalid GitHub profile link.";
    }

    return errors; // Return all errors at once
};
