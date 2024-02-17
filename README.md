## Command Line Instructions

```bash
# Complie TS to JS file in a `dist` folder
npm run build

# Run server using `ts-node`
npm run start

# Run server in development mRode
npm run dev

# Format code using `prettier`
npm run format

# Catch program bugs using `eslint`
npm run lint

# Unit test using `jest`
npm run test
```

## How to write a test using Jest
- Go to `src/tests` folder
- Make a file with postfix `.test.ts`
- Have the following layout with `describe` and `it`

```typescript
describe("the name of the test bundle", () => {
    it("the name of test 1", () => {
        expect(1 + 1).toEqual(2);
    });
    it("the name of test 2", () => {
        ...
    });
});

```