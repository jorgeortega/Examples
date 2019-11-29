import React, { useState } from "react";
import { Formik, Form, Field } from "formik";

function CustomInput({ field, form, ...props }) {
  return <input {...field} {...props} />;
}

function App() {
  const [result, setResult] = useState("");

  return (
    <Formik
      initialValues={{ email: "", name: "", color: "red" }}
      onSubmit={(values, actions) => {
        setResult(JSON.stringify(values));
      }}
    >
      {() => (
        <Form>
          <Field
            name="name"
            required
            placeholder="Name"
            component={CustomInput}
          />
          <br />
          <Field name="email">
            {({ field }) => (
              <div>
                <label>email:</label>
                <input type="email" required placeholder="Email" {...field} />
              </div>
            )}
          </Field>
          <br />
          <Field as="select" name="color" value="none">
            <option value="none">Pick a color</option>
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
          </Field>
          <br />
          <button type="submit">Submit</button>
          <br />
          <br />
          <Field as="textarea" value={result} style={{ width: "100%" }} />
        </Form>
      )}
    </Formik>
  );
}

export default App;
