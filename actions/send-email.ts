import {Resend} from "resend"
type SendEmailParams = {
    to: string | string[];
    subject: string;
    react: React.ReactElement;
};

export async function sendEmail({to, subject, react}: SendEmailParams) {
    const resend = new Resend(process.env.RESEND_API_KEY || "");
    try {
        const data = await resend.emails.send({
            from: "Chingu Finance <onboarding@resend.dev>",
            to,
            subject, 
            react
        })

        return {success: true, data}
    } catch (error) {
        
    }
}