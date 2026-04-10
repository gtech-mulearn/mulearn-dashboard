export type VideoTestimonial = {
  name: string;
  videoUrl: string;
  label?: string;
};

export type TestimonialType =
  | "learner"
  | "mentor"
  | "partner"
  | "community-leader";

export type SocialProofType = "LinkedIn" | "Instgram" | "Twitter" | "Community";

export type TextTestimonial = {
  id: string;
  name: string;
  muid?: string;
  profileImage?: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  type: TestimonialType;
  socialProof: SocialProofType;
  date: string;
};
