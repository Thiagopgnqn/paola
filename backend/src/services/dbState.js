let dbDownUntil = 0;

export const isDbDown = () => Date.now() < dbDownUntil;

export const markDbDown = (ms = 60000) => {
  dbDownUntil = Date.now() + ms;
};

export const resetDbState = () => {
  dbDownUntil = 0;
};
