const DeleteButton = ({ deleteHandler }) => {
  return <button onClick={deleteHandler}> delete </button>;
};

const DisplayPersons = ({ persons, search, deleteHandlerFact }) => {
  return (
    <table>
      <thead>
        <tr>
          <td>
            <strong>Name</strong>
          </td>
          <td>
            <strong>Phone Number</strong>
          </td>
        </tr>
      </thead>
      <tbody>
        {persons
          .filter((person) => person.name.toLowerCase().includes(search))
          .map((person) => (
            <tr key={person.id}>
              <td>{person.name}</td>
              <td>{person.number}</td>
              <td>
                <DeleteButton
                  deleteHandler={deleteHandlerFact(person.id, person.name)}
                />
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default DisplayPersons;
