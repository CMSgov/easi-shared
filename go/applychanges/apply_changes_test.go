package applychanges

import (
	"testing"
	"time"

	"github.com/google/uuid"
	_ "github.com/lib/pq" // required for postgres driver in sql
	"github.com/stretchr/testify/assert"
)

type Person struct {
	Name      string   `json:"name"`
	Age       int      `json:"age"`
	Nicknames []string `json:"nicknames"`
}

func TestApplyChanges(t *testing.T) {
	clay := Person{"Clay", 27, []string{"Clayboy", "Claysadilla"}}

	clayChanges := map[string]interface{}{
		"age": 28,
	}
	err := ApplyChanges(clayChanges, &clay)
	assert.NoError(t, err, "ApplyChanges failed.")
	assert.Equal(t, "Clay", clay.Name)
	assert.Equal(t, 28, clay.Age)
	assert.Equal(t, []string{"Clayboy", "Claysadilla"}, clay.Nicknames)

	clayChanges = map[string]interface{}{
		"nicknames": []string{},
	}
	err = ApplyChanges(clayChanges, &clay)
	assert.NoError(t, err, "ApplyChanges failed.")
	assert.Equal(t, "Clay", clay.Name)
	assert.Equal(t, 28, clay.Age)
	assert.Equal(t, []string{}, clay.Nicknames)

	clayChanges = map[string]interface{}{
		"nicknames": []string{"Clayson the Wise"},
		"age":       50,
	}
	err = ApplyChanges(clayChanges, &clay)
	assert.NoError(t, err, "ApplyChanges failed.")
	assert.Equal(t, "Clay", clay.Name)
	assert.Equal(t, 50, clay.Age)
	assert.Equal(t, []string{"Clayson the Wise"}, clay.Nicknames)
}

type PersonWithPointer struct {
	Name   string  `json:"name"`
	Parent *string `json:"parent"`
}

func TestApplyChangesEmptyString(t *testing.T) {
	mom := "Mom"
	son := PersonWithPointer{Name: "Son", Parent: &mom}

	sonChanges := map[string]interface{}{
		"parent": "",
	}
	err := ApplyChanges(sonChanges, &son)
	assert.NoError(t, err, "ApplyChanges failed.")
	assert.Equal(t, "Son", son.Name)
	assert.Nil(t, son.Parent) // should set to nil
}

type AwkwardFirstDate struct {
	WhenStarted time.Time `json:"whenStarted"`
	WhenEnded   time.Time `json:"whenEnded"`
	DidHaveFun  bool      `json:"didHaveFun"`
}

func TestApplyChangesWithTime(t *testing.T) {
	fd := AwkwardFirstDate{
		WhenStarted: time.Now(),
		WhenEnded:   time.Now(),
		DidHaveFun:  false,
	}

	fdChanges := map[string]interface{}{
		"whenStarted": time.Date(2022, 5, 8, 18, 0, 0, 0, time.UTC), // should work with 'time.Time's
		"whenEnded":   "2022-05-08T21:00:00Z",                       // and should work with strings in time.RFC3339Nano format
	}
	err := ApplyChanges(fdChanges, &fd)
	assert.NoError(t, err, "ApplyChanges failed.")
	assert.Equal(t, time.Date(2022, 5, 8, 18, 0, 0, 0, time.UTC), fd.WhenStarted)
	assert.Equal(t, time.Date(2022, 5, 8, 21, 0, 0, 0, time.UTC), fd.WhenEnded)
	assert.Equal(t, false, fd.DidHaveFun)

	fdChanges = map[string]interface{}{
		"didHaveFun": true,
	}
	err = ApplyChanges(fdChanges, &fd)
	assert.NoError(t, err, "ApplyChanges failed.")
	assert.Equal(t, time.Date(2022, 5, 8, 18, 0, 0, 0, time.UTC), fd.WhenStarted)
	assert.Equal(t, time.Date(2022, 5, 8, 21, 0, 0, 0, time.UTC), fd.WhenEnded)
	assert.Equal(t, true, fd.DidHaveFun)
}

type PersonWithUUID struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

// TestApplyChangesUUID tests that ApplyChanges works with UUIDs
// Note that this isn't how GQL passes UUIDs to resolvers, but is something we hackily use
// in tests to modify the ID of an entity.
func TestApplyChangesUUID(t *testing.T) {
	clay := PersonWithUUID{uuid.MustParse("cfe0965f-aa95-4ade-af54-838a85cc6644"), "Clay"}

	newID := "02a9920e-b015-4de3-8e32-fb965ac4653c"
	newIDBytes, err := uuid.MustParse(newID).MarshalBinary()
	assert.NoError(t, err)

	clayChanges := map[string]interface{}{
		"id": newIDBytes,
	}
	err = ApplyChanges(clayChanges, &clay)
	assert.NoError(t, err, "ApplyChanges failed.")
	assert.NoError(t, err, "ApplyChanges failed.")
	assert.Equal(t, newID, clay.ID.String())
	assert.Equal(t, "Clay", clay.Name)
}

type EmbedStruct struct {
	ID uuid.UUID `json:"id"`
}
type Embedder struct {
	EmbedStruct
	Name string `json:"name"`
}
type UltimateEmbedder struct {
	Embedder
	PowerLevel int `json:"powerLevel"`
}

func TestApplyChangesOnEmbeddedStructs(t *testing.T) {
	champion := UltimateEmbedder{
		PowerLevel: 7900,
		Embedder: Embedder{
			Name: "Vegeta",
			EmbedStruct: EmbedStruct{
				ID: uuid.Nil,
			},
		},
	}
	newID := "02a9920e-b015-4de3-8e32-fb965ac4653c"

	happyChanges := map[string]interface{}{
		"id":         uuid.MustParse(newID),
		"powerLevel": 9001,
		"name":       "Goku",
	}

	err := ApplyChanges(happyChanges, &champion)
	assert.NoError(t, err, "ApplyChanges failed.")

	assert.Equal(t, newID, champion.ID.String())
	assert.Equal(t, "Goku", champion.Name)
	assert.Equal(t, 9001, champion.PowerLevel)
	assert.Greater(t, champion.PowerLevel, 9000)

}
