const EntryForm = ({
  addPerson,
  newName,
  updateName,
  newNumber,
  updateNumber,
}) => {
  return (
    <form onSubmit={addPerson}>
      <div>
        name: <input value={newName} onChange={updateName} />
      </div>
      <div>
        number: <input value={newNumber} onChange={updateNumber} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

export default EntryForm;
