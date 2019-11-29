# React forms with Formik and unit testing with react-testing-library

## Setup

Formik is a nice library to speed up the process of creating forms in React. It
handles all the basic functionality like the form state, validation and
submission.

Let's begin by creating an empty create-react-app https://create-react-app.dev/

```
npx create-react-app my-app
```

Install the formik library

```
yarn add formik
```

## Using formik components

Remove the example code generated and import the formik library and some
components in App.js. We will use the react `useState` hook just to show the
values of the form in this example.

```js
import React, { useState } from 'react'
import { Formik, Form, Field } from 'formik'

function App() {
  const [result, setResult] = useState('')

  return (
    // Formik is the main component that handles all the logic
    // Form is just a regular html <form> wrapper
    <Formik>
      {() => (
        <Form>
        </Form>
      )}
      </Formik>
  )
}

export default App
```

Let's use the `Field` formik component to create some fields. Check the
see all possible props available
https://jaredpalmer.com/formik/docs/api/field#props-1

A default Field is an input type="text"

```html
  <Field name="fieldName" />
```

For the select, we specify the options as children

```jsx
  <Field as="select" name="color" value="none">
    <option value="none">Pick a color</option>
    <option value="red">Red</option>
    <option value="green">Green</option>
    <option value="blue">Blue</option>
  </Field>
```

In this example we are going to use a textarea to show the values after submit


```html
  <Field as="textarea" value={result} rows={5} />
```

Form props are passed down to children giving many options for custom fields

```jsx
  <Field name="email">
    {({ field }) => (
      <div>
        <label>email:</label>
        <input
          type="email"
          required
          placeholder="Email"
          {...field}
        />
      </div>
    )}
  </Field>
```

We can go further and just set a component prop. Form props will passed to this
component

```jsx
function CustomInput({ field, form, ...props }) {
  return <input {...field} {...props} />
}


<Field
  name="name"
  required
  placeholder="Name"
  component={CustomInput}
/>
```

A type="submit" will automatically handle form onSubmit

```html
  <button type="submit">Submit</button>
```

## Put everything together

This is the final example form created with formik. Formik needs the
initialValues prop to work properly.

```jsx
import React, { useState } from 'react'
import { Formik, Form, Field } from 'formik'

function CustomInput({ field, form, ...props }) {
  return <input {...field} {...props} />
}

function App() {
  const [result, setResult] = useState('')

  return (
    <Formik
      initialValues={{
        email: '',
        name: '',
        color: 'red'
      }}
      onSubmit={(values, actions) => {
        setResult(JSON.stringify(values))
      }}
    >
      {() => (
        <Form>
          <Field as="select" name="color" value="none">
            <option value="none">Pick a color</option>
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
          </Field>
          <br />
          <Field name="email">
            {({ field }) => (
              <div>
                <label>email:</label>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  {...field}
                />
              </div>
            )}
          </Field>
          <br />
          <Field
            name="name"
            required
            placeholder="Name"
            component={CustomInput}
          />
          <br />
          <button type="submit">Submit</button>
          <br />
          <br />
          <Field
            style={{ width: '100%'}}
            as="textarea"
            value={result}
            rows={2}
          />
        </Form>
      )}
      </Formik>
  )
}

export default App

```

Not so fancy, but I didn't wanted to pollute the code with styling.

## Unit testing with React Testing Library

Normally it's enough to use Jest and Enzyme to test components, but with Formik, internal React state and events get more complex under the hood and a simple `input.simulate('change')` doesn't work. Luckily there's a nice piece of software called Testing Library that has support for many frontend libraries and frameworks https://testing-library.com/docs/intro

First of all, install the library as dev dependency

```
yarn add --dev '@testing-library/react'
```

Test if the App doesn't crash first

```js
it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<App />, div)
})
```

Now let's pick all the field elements to be able to fire events with them

```jsx
it('submits correct values', () => {
  const { container } = render(<App />)
  const name = container.querySelector('input[name="name"]')
  const email = container.querySelector('input[name="email"]')
  const color = container.querySelector('input[name="color"]')
  const submit = container.querySelector('button[type="submit"]')
})
```

Let's change their values

```js
  fireEvent.change(name, {
    target: {
      value: 'mockname'
    }
  })

  fireEvent.change(email, {
    target: {
      value: 'mockemail'
    }
  })

  fireEvent.change(color, {
    target: {
      value: 'mockcolor'
    }
  })
```

We get this error

```
  Warning: An update to Formik inside a test was not wrapped in act(...).
    
    When testing, code that causes React state updates should be wrapped into act(...):
    
    act(() => {
      /* fire events that update state */
    });
    /* assert on the output */
```

This means that something changed Formik state inside the test, we need to wait for these changes. act is also good, but instead of act, we can also use Testing Library's `wait` https://testing-library.com/docs/dom-testing-library/api-async#wait

Notice that we will change the test to `async`

```js
it("submits correct values", async () => {
  const { container } = render(<App />)
  const name = container.querySelector('input[name="name"]')
  const email = container.querySelector('input[name="email"]')
  const color = container.querySelector('select[name="color"]')
  const submit = container.querySelector('button[type="submit"]')
  const results = container.querySelector("textarea");

  await wait(() => {
    fireEvent.change(name, {
      target: {
        value: "mockname"
      }
    })
  })

  await wait(() => {
    fireEvent.change(email, {
      target: {
        value: "mock@email.com"
      }
    })
  })

  await wait(() => {
    fireEvent.change(color, {
      target: {
        value: "green"
      }
    })
  })

  await wait(() => {
    fireEvent.click(submit)
  })

  expect(results.innerHTML).toBe(
    '{"email":"mock@email.com","name":"mockname","color":"green"}'
  )
})
```

Now we get the correct results and thanks to Testing Library we focus on functionality and DOM behavior instead of dealing with React details.

