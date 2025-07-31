import bcrypt from 'bcrypt'
export const encryptPassword = async (password: string) => {
    return await new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error("Error encrypting password:", err);
                reject(new Error("Failed to encrypt password"));
            }
            resolve(hash);

        });
    });
}


export const comparePassword = async (password: string, hash: string) => {
    return await new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (err, result) => {
            if (err) {
                console.error("Error comparing password:", err);
                reject(new Error("Failed to compare password"));
            }
            resolve(result);
        });
    });
}


