export const convertToBangkokTime = (utcMilisec: number) => {
	const date = new Date(utcMilisec + 7 * 60 * 60 * 1000); // Bangkok is UTC+7
	return date;
};
