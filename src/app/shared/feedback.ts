export class Feedback {
    firstname: string;
    lastname: string;
    telnum: number;
    email: string;
    agree: boolean;
    contacttype: string;
    message: string;
};

export class commentFeedback{
    author: string;
    rating: string;
    message: string;
}

export const ContactType = ['None', 'Tel', 'Email'];