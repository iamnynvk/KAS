import english from "./english.json";
import hindi from "./hindi.json";
import marathi from "./marathi.json";

export const localization = (languageIndex: any) => {
  let { label } = languageIndex
    ? languageIndex == 1
      ? hindi
      : marathi
    : english;
  return label;
};
