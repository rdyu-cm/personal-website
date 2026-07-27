export interface Profile {
  name: string;
  headline: string;
  affiliation?: string;
  shortBio: string;
  longBio: string[];
  links: { label: string; href: string }[];
  cvPath?: string;
  domain: string;
}

export function defineProfile(value: Profile): Profile {
  return value;
}

export const profile = defineProfile({
  name: "Ryan Yu",
  headline: "Chemical Engineering Undergraduate · AI for Science",
  affiliation: "California Institute of Technology",
  shortBio:
    "Chemical Engineering (Computational) undergraduate at Caltech researching molecular simulation, machine-learned potentials, and electrochemical interfaces.",
  longBio: [
    "Ryan Yu is a Chemical Engineering (Computational) undergraduate at the California Institute of Technology, studying from 2023 to 2027.",
    "In the Goddard Lab, Ryan uses molecular dynamics and metadynamics to study Smoothened/Gi activation. In the Fong Lab, Ryan develops machine-learning potentials for nitrate-reduction electrolytes and TiH2/electrolyte interfaces.",
    "Ryan also completed a data-science project on machine-learning prediction of LSER parameters for volatile organic compound soil partitioning.",
  ],
  links: [
    { label: "Email", href: "mailto:rdyu@caltech.edu" },
    { label: "GitHub", href: "https://github.com/rdyu-cm" },
  ],
  domain: "https://rdyu-cm.github.io/personal-website",
});
