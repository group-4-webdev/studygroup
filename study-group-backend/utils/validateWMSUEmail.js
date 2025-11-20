export const isAllowedWMSUEmail = (email) => {
  const wmsuRegex = /^([a-zA-Z]{2})(\d{4})(\d+)@wmsu\.edu\.ph$/;
  const match = email.match(wmsuRegex);
  if (!match) return false;

  const prefix = match[1].toLowerCase();
  const year = parseInt(match[2]);
  const currentYear = new Date().getFullYear();
  const minAllowedYear = currentYear - 4; 
  if (year < minAllowedYear || year > currentYear) return false;

  const yearPrefixMap = {
    2025: "ty",
    2024: "ae",
    2023: "hz",
    2022: "eh", 
    2021: "qb", 
  };

  return yearPrefixMap[year] === null || yearPrefixMap[year] === prefix;
};
