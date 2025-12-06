import { NextResponse } from "next/server";

type ProxyRequest = {
  name: string;
  description: string;
  request: {
    path: string;
    method: string;
    body: Record<string, unknown>;
  };
};

// Ready-to-use mock eligibility and dental requests for the Stedi test API.
// These are formatted to POST directly to /api/stedi/proxy.
const mockRequests: ProxyRequest[] = [
  {
    name: "Aetna dependent",
    description: "Dependent Jordan (child of John)",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        tradingPartnerServiceId: "60054",
        provider: { organizationName: "Provider Name", npi: "1999999984" },
        subscriber: { firstName: "John", lastName: "Doe", memberId: "AETNA9wcSu" },
        dependents: [{ firstName: "Jordan", lastName: "Doe", dateOfBirth: "20010714" }],
        encounter: { serviceTypeCodes: ["30"] },
      },
    },
  },
  {
    name: "Anthem BCBSCA dependent",
    description: "Dependent John (spouse of Jane)",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        tradingPartnerServiceId: "040",
        provider: { organizationName: "Provider Name", npi: "1999999984" },
        subscriber: { firstName: "Jane", lastName: "Doe", memberId: "CGMBCBSCA123" },
        dependents: [{ firstName: "John", lastName: "Doe", dateOfBirth: "19750101" }],
        encounter: { serviceTypeCodes: ["30"] },
      },
    },
  },
  {
    name: "BCBSTX dependent",
    description: "Dependent Jane (child of John)",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        tradingPartnerServiceId: "G84980",
        provider: { organizationName: "Provider Name", npi: "1999999984" },
        subscriber: { firstName: "John", lastName: "Doe", memberId: "A2CBCBSTX123" },
        dependents: [{ firstName: "Jane", lastName: "Doe", dateOfBirth: "20150101" }],
        encounter: { serviceTypeCodes: ["30"] },
      },
    },
  },
  {
    name: "Cigna dependent",
    description: "Dependent Jordan (child of John)",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        tradingPartnerServiceId: "62308",
        provider: { organizationName: "Provider Name", npi: "1999999984" },
        subscriber: { firstName: "John", lastName: "Doe", memberId: "CIGNAJTUxNm" },
        dependents: [{ firstName: "Jordan", lastName: "Doe", dateOfBirth: "20150920" }],
        encounter: { serviceTypeCodes: ["30"] },
      },
    },
  },
  {
    name: "Oscar dependent",
    description: "Dependent Jane (child of John)",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        tradingPartnerServiceId: "OSCAR",
        provider: { organizationName: "Provider Name", npi: "1999999984" },
        subscriber: { firstName: "John", lastName: "Doe", memberId: "OSCAR123456" },
        dependents: [{ firstName: "Jane", lastName: "Doe", dateOfBirth: "20010101" }],
        encounter: { serviceTypeCodes: ["30"] },
      },
    },
  },
  {
    name: "UHC dependent",
    description: "Dependent Jane (spouse of John)",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        tradingPartnerServiceId: "87726",
        provider: { organizationName: "Provider Name", npi: "1999999984" },
        subscriber: { firstName: "John", lastName: "Doe", memberId: "UHC202649" },
        dependents: [{ firstName: "Jane", lastName: "Doe", dateOfBirth: "19521121" }],
        encounter: { serviceTypeCodes: ["30"] },
      },
    },
  },
  {
    name: "Aetna subscriber",
    description: "Subscriber only",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        tradingPartnerServiceId: "60054",
        provider: { organizationName: "Provider Name", npi: "1999999984" },
        subscriber: {
          firstName: "Jane",
          lastName: "Doe",
          dateOfBirth: "20040404",
          memberId: "AETNA12345",
        },
        encounter: { serviceTypeCodes: ["30"] },
      },
    },
  },
  {
    name: "Ambetter subscriber",
    description: "Subscriber only",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        tradingPartnerServiceId: "68069",
        provider: { organizationName: "Provider Name", npi: "1999999984" },
        subscriber: {
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: "19940404",
          memberId: "AMBETTER123",
        },
        encounter: { serviceTypeCodes: ["30"] },
      },
    },
  },
  {
    name: "Cigna subscriber James Jones",
    description: "Subscriber only",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        controlNumber: "123456789",
        tradingPartnerServiceId: "62308",
        provider: { organizationName: "Provider Name", npi: "1999999984" },
        subscriber: {
          firstName: "James",
          lastName: "Jones",
          dateOfBirth: "19910202",
          memberId: "23456789100",
        },
        encounter: { serviceTypeCodes: ["30"] },
      },
    },
  },
  {
    name: "Humana subscriber",
    description: "Subscriber only",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        tradingPartnerServiceId: "61101",
        provider: { organizationName: "Provider Name", npi: "1999999984" },
        subscriber: {
          firstName: "Jane",
          lastName: "Doe",
          dateOfBirth: "19750505",
          memberId: "HUMANA123",
        },
        encounter: { serviceTypeCodes: ["30"] },
      },
    },
  },
  {
    name: "Kaiser subscriber",
    description: "Subscriber only",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        tradingPartnerServiceId: "KSRCN",
        provider: { organizationName: "Provider Name", npi: "1999999984" },
        subscriber: {
          firstName: "Jane",
          lastName: "Doe",
          dateOfBirth: "20020202",
          memberId: "KAISER123456",
        },
        encounter: { serviceTypeCodes: ["30"] },
      },
    },
  },
  {
    name: "CMS subscriber",
    description: "Subscriber only",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        tradingPartnerServiceId: "CMS",
        provider: { organizationName: "Provider Name", npi: "1999999984" },
        subscriber: {
          firstName: "Jane",
          lastName: "Doe",
          dateOfBirth: "19550505",
          memberId: "CMS12345678",
        },
        encounter: { serviceTypeCodes: ["30"] },
      },
    },
  },
  {
    name: "UHC inactive",
    description: "Inactive coverage mock",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        tradingPartnerServiceId: "87726",
        provider: { organizationName: "Provider Name", npi: "1999999984" },
        subscriber: {
          firstName: "Jane",
          lastName: "Doe",
          dateOfBirth: "19710101",
          memberId: "UHCINACTIVE",
        },
        encounter: { serviceTypeCodes: ["30"] },
      },
    },
  },
  {
    name: "UHC AAA42",
    description: "AAA 42 Unable to respond",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        tradingPartnerServiceId: "87726",
        provider: { organizationName: "Medical Provider", npi: "1999999984" },
        subscriber: {
          firstName: "Jane",
          lastName: "Doe",
          dateOfBirth: "20010101",
          memberId: "UHCAAA42",
        },
        encounter: { serviceTypeCodes: ["30"] },
      },
    },
  },
  {
    name: "UHC AAA43",
    description: "AAA 43 Invalid/Missing Provider ID",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        tradingPartnerServiceId: "87726",
        provider: { organizationName: "Medical Provider", npi: "1999999984" },
        subscriber: {
          firstName: "Jane",
          lastName: "Doe",
          dateOfBirth: "19700101",
          memberId: "UHCAAA43",
        },
        encounter: { serviceTypeCodes: ["30"] },
      },
    },
  },
  {
    name: "UHC AAA72",
    description: "AAA 72 Invalid/Missing Subscriber ID",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        tradingPartnerServiceId: "87726",
        provider: { organizationName: "Medical Provider", npi: "1999999984" },
        subscriber: {
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: "19900101",
          memberId: "UHCAAA72",
        },
        encounter: { serviceTypeCodes: ["30"] },
      },
    },
  },
  {
    name: "UHC AAA73",
    description: "AAA 73 Invalid/Missing Subscriber Name",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        tradingPartnerServiceId: "87726",
        provider: { organizationName: "Medical Provider", npi: "1999999984" },
        subscriber: {
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: "19900101",
          memberId: "UHCAAA73",
        },
        encounter: { serviceTypeCodes: ["30"] },
      },
    },
  },
  {
    name: "Stedi Agent (designed to fail)",
    description: "Returns AAA 73 for agent demo",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        tradingPartnerServiceId: "STEDI",
        subscriber: { lastName: "Prohas", memberId: "23051322", firstName: "Bernie" },
        provider: { organizationName: "STEDI", npi: "1999999984" },
      },
    },
  },
  {
    name: "CMS MBI lookup",
    description: "MBI lookup with SSN",
    request: {
      path: "/2024-04-01/change/medicalnetwork/eligibility/v3",
      method: "POST",
      body: {
        controlNumber: "112233445",
        tradingPartnerServiceId: "MBILU",
        provider: { organizationName: "Provider Name", npi: "1999999984" },
        subscriber: { lastName: "Doe", dateOfBirth: "19550505", ssn: "123456789" },
        encounter: { serviceTypeCodes: ["30"] },
      },
    },
  },
];

export async function GET() {
  return NextResponse.json({ mockRequests });
}
