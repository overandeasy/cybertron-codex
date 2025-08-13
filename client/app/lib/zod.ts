

import * as z from 'zod/v4'

export const signUpFormSchema = z.object({

    firstName: z
        .string()
        .min(1, "First name is required")
        .max(50, "First name must be at most 50 characters")
        .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),

    lastName: z
        .string()
        .min(1, "Last name is required")
        .max(50, "Last name must be at most 50 characters")
        .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),


    email: z.email("Invalid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character.")
        .max(100, "Password must be at most 100 characters")
        .regex(/[a-z]/, "Must include a lowercase letter")
        .regex(/[A-Z]/, "Must include an uppercase letter")
        .regex(/[0-9]/, "Must include a number")
        .regex(/[^a-zA-Z0-9]/, "Must include a special character"),
    confirmPassword: z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],

    });


export const signInFormSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});


const COUNTRY_LIST = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
    "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China, Mainland", "China, Hong Kong S.A.R.", "China, Macau S.A.R.", "China, Taiwan", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica",
    "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
    "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. Swaziland)", "Ethiopia", "Fiji", "Finland", "France",
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
    "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
    "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
    "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
    "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal",
    "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
    "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
    "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
    "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
    "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan",
    "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Türkiye", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela",
    "Vietnam", "Yemen", "Zambia", "Zimbabwe"
] as const;

export const SOCIAL_KEYS = [
    'Bilibili', 'Discord', 'Douyin', 'Facebook', 'Flickr', 'GitLab', 'Github', 'Instagram', 'LinkedIn', 'Medium', 'Pinterest', 'QQ', 'Quora', 'Reddit', 'Rednote', 'Signal', 'Snapchat', 'Stack Overflow', 'Telegram', 'Threads', 'TikTok', 'Tumblr', 'Twitch', 'Vimeo', 'WeChat', 'Weibo', 'Website', 'WhatsApp', 'X', 'Youtube', 'Other'
] as const;

const SocialLinkSchema = z.object({
    key: z.enum(SOCIAL_KEYS),
    value: z.string().min(1, "Link should not be empty")
});

export const userProfileFormSchema = z.object({
    first_name: z
        .string()
        .min(1, "First name is required")
        .max(50, "First name must be at most 50 characters")
        .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
    last_name: z
        .string()
        .min(1, "Last name is required")
        .max(50, "Last name must be at most 50 characters")
        .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),

    newImage: z
        .instanceof(File)
        .refine(
            (file) => file && file.type.startsWith('image/'),
            { message: "File must be an image" }
        )
        .refine(
            (file) => file && file.size <= 5 * 1024 * 1024,
            { message: "Image must be under 5MB" }
        ).optional(),
    bio: z.string().refine(
        (val) => val.trim().split(/\s+/).length <= 500,
        { message: "Bio shouldn't be more than 500 words" }
    ),
    country: z.enum(COUNTRY_LIST).optional(),
    languages: z.array(
        z.object({
            name: z.string()
        })
    ),
    faction: z.enum(['Autobot', 'Decepticon']).optional(),
    species: z.enum(['Cybertronian', 'Terran', 'Other']).optional(),
    social_links: z
        .array(SocialLinkSchema)
        .refine((arr) => {
            const keys = arr.map((item) => item.key);
            return new Set(keys).size === keys.length;
        }, {
            message: 'Duplicate social link keys are not allowed',
            path: ['social_links']
        }).optional()
}).refine(data => {
    // Ensure at least one social link is provided if social_links is not empty
    const links = data.social_links;
    return !links || Object.values(links).some(link => link);
});


export type SignUpFormData = z.infer<typeof signUpFormSchema>
export type SignInFormData = z.infer<typeof signInFormSchema>
export type UserProfileFormData = z.infer<typeof userProfileFormSchema>
export type UserProfile = Omit<z.infer<typeof userProfileFormSchema>, 'newImage'> & {
    user_id: {
        _id: string;
        email: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    };

    images: string[];
    createdAt: Date;
    updatedAt: Date;
}


// Schema for image file validation for file upload in the EditMyProfile component
export const imageFileSchema = z
    .instanceof(File, { message: "File is required." })
    .refine((file) => file.size <= 3 * 1024 * 1024, {
        message: "Image must be 3MB or smaller.",
    })
    .refine((file) => file.type.startsWith("image/"), {
        message: "Only image files are accepted.",
    });