import { t, Value } from ".";

const user = t.Object({
	name: t.String(),
	email: t.Email(),
	password: t.Password(),
	mobile: t.String({
		prefix: "+977",
		length: 10,
	}),
	roles: t.Csv({
		minValues: 4,
	}),

	gender: t.Array(t.String()),
});

const invalidData = {
	name: "Anakin Skywalker",
	email: "anakin.skywalker@gmail.com",
	password: "aAs2Ah2@19sn29",
	mobile: "+9771234567890",
	roles: "user,aa,d,a,d,d,f,fff",
	gender: ["male", "female"],
	family: "jsd",
	hd: "yre",
};

const isValid = Value.Check(user, invalidData);

console.log("isValid", isValid);

const { data, error } = t.TryParse(user, invalidData);
console.log("data", data, error);
