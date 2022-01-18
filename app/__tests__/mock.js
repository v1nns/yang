/* -------------------------------------------------------------------------- */
/*                                  Mock Data                                 */
/* -------------------------------------------------------------------------- */

export const chids = [
  {
    subject: "Expose index of the group for a line",
    status: "NEW",
    id: "326205",
    verified: -1,
    codeReview: 0,
  },
  {
    subject: "Validate reviewer filters",
    status: "NEW",
    id: "269047",
    verified: 1,
    codeReview: 0,
  },
  {
    subject: "Abstract Publisher/Subscriber into generic interfaces",
    status: "MERGED",
    id: "321037",
    verified: 1,
    codeReview: 2,
  },
];

export const multipleChids = [
  {
    subject: "Expose index of the group for a line",
    status: "NEW",
    id: "326205",
    verified: -1,
    codeReview: 0,
  },
  {
    subject: "Validate reviewer filters",
    status: "NEW",
    id: "269047",
    verified: 1,
    codeReview: 0,
  },
  {
    subject: "Abstract Publisher/Subscriber into generic interfaces",
    status: "MERGED",
    id: "321037",
    verified: 1,
    codeReview: 2,
  },
  {
    subject: "Do not expose index of the group for a line",
    status: "NEW",
    id: "326206",
    verified: -1,
    codeReview: 0,
  },
  {
    subject: "Do not validate reviewer filters",
    status: "NEW",
    id: "269048",
    verified: 1,
    codeReview: 0,
  },
  {
    subject: "Abstract Publisher/Subscriber into specific interfaces",
    status: "MERGED",
    id: "321038",
    verified: 1,
    codeReview: 2,
  },
];

/* -------------------------------------------------------------------------- */

export const config = {
  refreshTime: 30,
  endpoint: "https://hereweare.testing.it",
  credentials: {
    email: "johnny@b.goode",
    password: "ultrasecretpassword",
  },
};

/* -------------------------------------------------------------------------- */

export const labelApproved = {
  approved: {
    _account_id: 7,
    name: "John Connor",
    email: "john.connor@bad.boy",
    username: "jconnor",
  },
  all: [
    {
      value: 0,
      date: "2022-01-13 14:59:50.000000000",
      _account_id: 4,
      name: "Auto QA",
      email: "svc_ped-datacenter@datacom.ind.br",
      username: "svc_ped-datacenter",
    },
    {
      value: 1,
      date: "2022-01-13 16:25:30.000000000",
      _account_id: 7,
      name: "John Connor",
      email: "john.connor@bad.boy",
      username: "jconnor",
    },
  ],
};

export const labelRejected = {
  rejected: {
    _account_id: 9,
    name: "Scooby Doo",
    email: "scooby@dooby.doo",
    username: "shaggyisnotcool",
  },
  all: [
    {
      value: -2,
      date: "2022-01-07 22:39:50.000000000",
      _account_id: 9,
      name: "Scooby Doo",
      email: "scooby@dooby.doo",
      username: "shaggyisnotcool",
    },
    {
      value: 1,
      date: "2022-01-06 14:59:32.000000000",
      _account_id: 70,
      name: "Shaggy Rogers",
      email: "shaggy@rogers.com",
      username: "scoobywhereareyou",
    },
  ],
};
