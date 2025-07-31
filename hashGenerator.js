import crypto from "crypto";

export const generateHashCode = () => {
    var hash1=crypto.randomBytes(4);
    var hash2=hash1.toString("hex");
    var hash3=hash2.toUpperCase();
    var hash4=hash3.slice(0, 8);
    return hash4;
};
