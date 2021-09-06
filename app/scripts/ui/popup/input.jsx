import React from "react";

import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import Button from "@material-ui/core/Button";

import AddBoxIcon from "@material-ui/icons/AddBox";

export default function InputChid() {
  return (
    <div>
      <Typography variant="caption">
        To start using it, you can add any change-id in the input field below.
      </Typography>
      <Grid container justifyContent="flex-end">
        <Button color="default" size="small" startIcon={<AddBoxIcon />}>
          Add chid
        </Button>
      </Grid>
    </div>
  );
}
