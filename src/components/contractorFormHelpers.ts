/* Shared helpers & styles for ContractorFormDialog and its consumers */

export const countryCodes = [
  { code: "+56", flag: "https://flagcdn.com/w20/cl.png", label: "Chile" },
  { code: "+549", flag: "https://flagcdn.com/w20/ar.png", label: "Argentina" },
];

export const extractCountryAndPhone = (fullPhone: string) => {
  for (const cc of countryCodes) {
    if (fullPhone.startsWith(cc.code)) {
      return {
        countryCode: cc.code,
        localPhone: fullPhone.slice(cc.code.length),
      };
    }
  }
  return { countryCode: "+56", localPhone: fullPhone };
};

/* Shared field style for rounded inputs */
export const fieldSx = (t: any) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: t.palette.mode === "dark" ? "#252525" : "#F9FAFB",
    "& fieldset": {
      borderColor: t.palette.mode === "dark" ? "#444" : "#E5E7EB",
    },
    "&:hover fieldset": {
      borderColor: t.palette.mode === "dark" ? "#666" : "#D1D5DB",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#415EDE",
    },
  },
});

export const selectFieldSx = (t: any) => ({
  borderRadius: "12px",
  backgroundColor: t.palette.mode === "dark" ? "#252525" : "#F9FAFB",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: t.palette.mode === "dark" ? "#444" : "#E5E7EB",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: t.palette.mode === "dark" ? "#666" : "#D1D5DB",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#415EDE",
  },
});
