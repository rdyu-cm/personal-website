export interface Profile {
  name: string;
  headline: string;
  homepageSummary: string;
  affiliation?: string;
  shortBio: string;
  links: { label: string; href: string }[];
  domain: string;
}

export function defineProfile(value: Profile): Profile {
  return value;
}

export const profile = defineProfile({
  name: "Ryan Yu",
  headline: "Chemical Engineering Undergraduate · AI for Science",
  homepageSummary:
    "Interpretable protein representations, machine-learned potentials, and molecular mechanisms.",
  affiliation: "California Institute of Technology",
  shortBio:
    "Caltech Chemical Engineering (Computational) undergraduate working across interpretable protein representations, machine-learned interatomic potentials, and molecular simulation.",
  links: [
    { label: "Email", href: "mailto:rdyu@caltech.edu" },
    { label: "GitHub", href: "https://github.com/rdyu-cm" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/ryan-yu-0bb27a23b",
    },
  ],
  domain: "https://rdyu-cm.github.io/personal-website",
});
