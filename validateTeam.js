export const validateTeamInputs = (teamName, regNo) => {
    let errors = {};

    const regNoPattern = /^[0-9]{2}[A-Za-z]{3}[0-9]{4}$/;
    if (!regNoPattern.test(regNo)) {
        errors.regNo = "Invalid Registration Number (Format: XXZZZXXXX).";
    }

    if (!teamName.trim()) {
        errors.teamName = "Team name is required.";
    }

    return errors;
};
