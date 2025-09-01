import { useState, useEffect } from "react";
import personService from "./services/persons";
import DisplayPersons from "./components/DisplayPersons";
import EntryForm from "./components/EntryForm";
import FilterBar from "./components/FilterBar";
import Notification from "./components/Notification";

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchPersons = () => {
    personService
      .getAll()
      .then((response) => {
        setPersons(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };
  useEffect(fetchPersons, []);

  const clearInputs = () => {
    setNewName("");
    setNewNumber("");
  };

  const setMessage = (message, type) => {
    if (type === "error") {
      setErrorMessage(message);
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    } else if (type === "success") {
      setSuccessMessage(message);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  };

  const handleExistingPerson = (existingPerson, newPerson) => {
    if (
      window.confirm(`${newName} is already added to phonebook, 
        replace the old number with a new one?`)
    ) {
      personService
        .update(existingPerson.id, newPerson)
        .then((response) => {
          setPersons(
            persons.map((person) =>
              person.id !== response.data.id ? person : response.data
            )
          );
          clearInputs();
          setMessage(`Updated ${newPerson.name}'s number`, "success");
        })
        .catch((error) => {
          console.error("Error updating person:", error);
          const errorMessage =
            error.response?.data?.error || `Unable to update ${newPerson.name}`;
          setMessage(errorMessage, "error");
        });
    }
  };

  const handleNewPerson = (newPerson) => {
    personService
      .create(newPerson)
      .then((response) => {
        console.log(response);
        setPersons(persons.concat(response.data));
        clearInputs();
        setMessage(`Added ${newPerson.name}`, "success");
      })
      .catch((error) => {
        console.error("Error adding person:", error);
        const errorMessage =
          error.response?.data?.error || `Unable to add ${newPerson.name}`;
        setMessage(errorMessage, "error");
      });
  };

  const addPerson = (event) => {
    event.preventDefault();
    const newPerson = {
      name: newName,
      number: newNumber,
    };
    const existingPerson = persons.find(
      (person) => person.name.toLowerCase() === newName.toLowerCase()
    );
    existingPerson
      ? handleExistingPerson(existingPerson, newPerson)
      : handleNewPerson(newPerson);
  };

  const deleteHandlerFact = (id, name) => {
    return () => {
      if (window.confirm(`Delete ${name} ?`)) {
        personService
          .remove(id)
          .then(() => {
            setPersons(persons.filter((person) => person.id !== id));
          })
          .catch((error) => {
            console.error("Error deleting person:", error);
          });
      }
    };
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={errorMessage} messageClass="error" />
      <Notification message={successMessage} messageClass="success" />
      <FilterBar
        search={search}
        searchName={(event) =>
          setSearch(event.target.value.toLowerCase().trim())
        }
      />
      <h2>Add a new</h2>
      <EntryForm
        addPerson={addPerson}
        newName={newName}
        updateName={(event) => setNewName(event.target.value)}
        newNumber={newNumber}
        updateNumber={(event) => setNewNumber(event.target.value)}
      />
      <h2>Numbers</h2>
      <DisplayPersons
        persons={persons}
        search={search}
        deleteHandlerFact={deleteHandlerFact}
      />
    </div>
  );
};

export default App;
