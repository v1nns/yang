import { isEmpty, pick } from "lodash";
import axios from "axios";

/* -------------------------------------------------------------------------- */
/*                                 Gerrit API                                 */
/* -------------------------------------------------------------------------- */

const gerrit = {
  async query(options, chid) {
    const url = `${options.endpoint}/changes/${chid}/detail`;

    let data = null;
    try {
      data = await axios
        .get(
          url,
          {},
          {
            auth: {
              username: options.credentials.email,
              password: options.credentials.password,
            },
          }
        )
        .then((response) => (response.status == 200 ? response.data : {}));
    } catch (err) {
      console.log("Change-Id:", chid, "Error:", err);
      data = { id: chid.toString(), error: true };
    }

    // Simply return empty
    if (isEmpty(data) || data.error) {
      return data;
    }

    // Otherwise, parse it
    const object = JSON.parse(data.toString().replace(")]}'", ""));
    const raw = pick(object, ["_number", "subject", "status", "labels"]);
    const change = convertGerritData(raw);

    return change;
  },
};

/* ------ Get latest label entry (considering date value) in array list ----- */

function filterLabel(items) {
  const reviews = items.filter((obj) => obj.value != 0);

  // Get the first value
  let value = reviews[0].value;

  // Compare with the rest and return the smaller value
  for (let index = 1; index < reviews.length; index++) {
    if (reviews[index].value < value) {
      value = item.value;
    }
  }
  return value;
}

/* ----------- Convert JSON object from REST API to custom object ----------- */

function convertGerritData(raw) {
  const change = pick(raw, ["subject", "status"]);
  change.id = raw._number.toString();
  change.verified = 0;
  change.codeReview = 0;

  // filter "Verified" label
  if (raw.labels["Verified"]["all"] !== undefined) {
    change.verified = filterLabel(raw.labels["Verified"]["all"]);
  }

  // filter "Code-Review" label
  if (raw.labels["Code-Review"]["all"] !== undefined) {
    change.codeReview = filterLabel(raw.labels["Code-Review"]["all"]);
  }

  return change;
}

export default gerrit;
