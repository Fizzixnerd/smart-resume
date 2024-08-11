import { Bool } from "o1js";
import { RevokableAgreement } from "./Agreement";

export type JulianDay = number

export type Gender = string;

export type Country = string;

export type Email = string;

export type PhoneNumber = string;

export type Degree = string;

export type Gpa = string;

export type Address = {
  streetAddress: string;
  country: Country;
}

export type Job = {
  title: string;
  startDate: JulianDay;
  endDate: JulianDay | null | undefined;
  jobDescription: string;
  skills: string[];
}

export type BasicInfo = {
  legalName: string;
  knownAsName: string;
  gender: Gender;
  address: Address;
  email: Email;
  phoneNumber: PhoneNumber;
};

export type Education = {
  institutionLegalName: string;
  degree: Degree;
  subject: string;
  graduationDate: JulianDay;
  gpa: Gpa | null | undefined;
}

export type WorkHistory = {
  employerLegalName: string;
  employerAddress: Address;
  jobs: Job[]
}

export class Resume {
  basicInfo: RevokableAgreement<BasicInfo>;
  workHistory: RevokableAgreement<WorkHistory>[];
  education: RevokableAgreement<Education>[];

  constructor(basicInfo: RevokableAgreement<BasicInfo>, workHistory: RevokableAgreement<WorkHistory>[], education: RevokableAgreement<Education>[]) {
    this.basicInfo = basicInfo;
    this.workHistory = workHistory;
    this.education = education
  }

  async areAllInEffect(): Promise<Bool> {
    let inEffect = await this.basicInfo.isInEffect()
    for (const history of this.workHistory) {
      inEffect = inEffect.and(await history.isInEffect())
    }
    for (const education of this.education) {
      inEffect = inEffect.and(await education.isInEffect())
    }
    return inEffect;
  }
}